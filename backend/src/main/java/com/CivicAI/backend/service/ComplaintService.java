package com.CivicAI.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.entity.Department;
import com.CivicAI.backend.entity.User;
import com.CivicAI.backend.repository.ComplaintRepository;
import com.CivicAI.backend.repository.DepartmentRepository;
import com.CivicAI.backend.repository.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmailService emailService;

    private static final String UPLOAD_DIR = "uploads/complaints";

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            EmailService emailService) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // SUBMIT COMPLAINT - REGISTERED USER
    // =========================================================

    public Complaint submitComplaint(Complaint complaint, Long userId) {

        if (complaint == null) {
            throw new IllegalArgumentException("Complaint data is required");
        }

        validateComplaint(complaint);

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException("User not found with ID: " + userId));

            complaint.setUser(user);
            complaint.setGuestEmail(null);
        }

        prepareComplaint(complaint);

        Complaint savedComplaint = complaintRepository.save(complaint);

        emailService.sendComplaintSubmittedEmail(savedComplaint);

        return savedComplaint;
    }

    // =========================================================
    // SUBMIT MULTIPART COMPLAINT
    // =========================================================

    public Complaint submitMultipartComplaint(
            Complaint complaint,
            Long userId,
            MultipartFile image) {

        if (complaint == null) {
            throw new IllegalArgumentException("Complaint data is required");
        }

        validateComplaint(complaint);

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException("User not found with ID: " + userId));

            complaint.setUser(user);
            complaint.setGuestEmail(null);
        }

        if (image != null && !image.isEmpty()) {
            complaint.setImagePath(saveImage(image));
        }

        prepareComplaint(complaint);

        Complaint savedComplaint = complaintRepository.save(complaint);

        emailService.sendComplaintSubmittedEmail(savedComplaint);

        return savedComplaint;
    }

    // =========================================================
    // GUEST COMPLAINT
    // =========================================================

    public Complaint submitGuestComplaint(
            Complaint complaint,
            MultipartFile image) {

        if (complaint == null) {
            throw new IllegalArgumentException("Complaint data is required");
        }

        validateComplaint(complaint);

        complaint.setUser(null);

        if (complaint.getGuestEmail() != null) {
            String guestEmail = complaint.getGuestEmail().trim();

            complaint.setGuestEmail(
                    guestEmail.isEmpty() ? null : guestEmail);
        }

        if (image != null && !image.isEmpty()) {
            complaint.setImagePath(saveImage(image));
        }

        prepareComplaint(complaint);

        Complaint savedComplaint = complaintRepository.save(complaint);

        emailService.sendComplaintSubmittedEmail(savedComplaint);

        return savedComplaint;
    }

    // =========================================================
    // COMMON COMPLAINT PREPARATION
    // =========================================================

    private void prepareComplaint(Complaint complaint) {

        if (complaint.getStatus() == null
                || complaint.getStatus().trim().isEmpty()) {
            complaint.setStatus("SUBMITTED");
        } else {
            complaint.setStatus(normalizeStatus(complaint.getStatus()));
        }

        complaint.setCategory(categorizeComplaint(complaint));
        complaint.setPriority(calculatePriority(complaint));

        if (complaint.getCreatedAt() == null) {
            complaint.setCreatedAt(LocalDateTime.now());
        }

        if (complaint.getDuplicate() == null) {
            complaint.setDuplicate(false);
        }

        if (complaint.getCitizenVerified() == null) {
            complaint.setCitizenVerified(false);
        }

        if (complaint.getDepartment() == null) {
            allocateDepartment(complaint);
        }

        checkForDuplicate(complaint);
    }

    // =========================================================
    // STATUS NORMALIZATION
    // =========================================================

    private String normalizeStatus(String status) {

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        return status.trim()
                .toUpperCase()
                .replaceAll("[\\s-]+", "_");
    }

    // =========================================================
    // PRIORITY CALCULATION
    // =========================================================

    private String calculatePriority(Complaint complaint) {

        String title = normalizeText(complaint.getTitle());
        String description = normalizeText(complaint.getDescription());
        String fullText = title + " " + description;

        int criticalScore = 0;
        int highScore = 0;
        int mediumScore = 0;

        criticalScore += scorePhrases(fullText, 10,
                "life is in danger", "life in danger",
                "people are in danger", "people in danger",
                "someone may die", "people may die",
                "risk to life", "danger to life",
                "life threatening", "life threatening situation",
                "people are getting injured", "people getting injured",
                "someone got injured", "someone is injured",
                "people got injured", "people are hurt",
                "someone is hurt", "immediate danger",
                "very dangerous", "extremely dangerous",
                "serious danger", "dangerous situation",
                "unsafe for people", "unsafe for children",
                "emergency situation", "please help immediately",
                "need immediate help", "needs immediate attention");

        criticalScore += scorePhrases(fullText, 12,
                "gas cylinder blast", "gas cylinder burst",
                "gas cylinder exploded", "gas cylinder explosion",
                "cylinder blast", "cylinder burst",
                "cylinder exploded", "cylinder explosion",
                "gas is leaking", "gas leak", "gas leakage",
                "gas coming out", "smell of gas",
                "strong gas smell", "gas smell",
                "fire started", "fire has started",
                "fire broke out", "fire broke",
                "house is on fire", "building is on fire",
                "shop is on fire", "fire is spreading",
                "flames are coming", "flames coming out",
                "something is burning", "there was an explosion",
                "explosion happened", "explosion occurred",
                "there was a blast", "blast happened",
                "blast occurred", "building exploded");

        criticalScore += scoreWords(fullText, 8,
                "fire", "explosion", "blast", "burning",
                "flames", "explode", "exploded", "burst");

        criticalScore += scorePhrases(fullText, 10,
                "live wire", "live electric wire",
                "live electricity wire", "wire is hanging",
                "wire hanging", "wire has fallen", "wire fell down",
                "wire lying on road", "wire lying on street",
                "electric wire on road", "electric wire on street",
                "broken electric wire", "electric wire is broken",
                "someone may get shocked", "people may get shocked",
                "children may get shocked", "risk of electric shock",
                "electric shock risk", "current is leaking",
                "electricity is leaking", "sparks are coming",
                "sparks coming", "sparks from wire",
                "sparks from pole", "electric pole has fallen",
                "electric pole fell", "pole is about to fall",
                "electric pole may fall");

        criticalScore += scorePhrases(fullText, 10,
                "accident happened", "accident has happened",
                "accident occurred",
                "people met with an accident",
                "people are meeting with accidents",
                "vehicles are crashing",
                "vehicles are getting into accidents",
                "someone fell and got injured",
                "people are falling and getting injured",
                "someone got hurt", "people got hurt",
                "many people got hurt", "someone was injured",
                "people were injured", "children are at risk");

        criticalScore += scorePhrases(fullText, 12,
                "building collapsed", "building has collapsed",
                "house collapsed", "house has collapsed",
                "wall collapsed", "wall has collapsed",
                "bridge collapsed", "bridge has collapsed",
                "road collapsed", "road has collapsed",
                "roof collapsed", "roof has collapsed",
                "building may collapse", "house may collapse",
                "wall may collapse", "bridge may collapse",
                "road may collapse", "about to collapse",
                "going to collapse", "structure is falling",
                "structure may fall", "wall is falling",
                "tree is about to fall", "tree may fall");

        highScore += scorePhrases(fullText, 5,
                "no water", "no water supply", "water has stopped",
                "water stopped", "water is not coming",
                "water not coming", "no drinking water",
                "we have no water", "whole area has no water",
                "entire area has no water", "no electricity",
                "electricity has stopped", "power has gone",
                "power is gone", "power cut", "power outage",
                "no power", "electricity not available",
                "garbage has not been collected",
                "garbage not collected",
                "waste has not been collected", "waste not collected",
                "garbage is overflowing", "garbage overflowing",
                "dustbin is overflowing", "dustbins are overflowing",
                "road is badly damaged", "road badly damaged",
                "road is completely damaged", "road completely damaged",
                "large pothole", "big pothole", "huge pothole");

        highScore += scorePhrases(fullText, 4,
                "very badly damaged", "badly damaged",
                "heavily damaged", "completely damaged",
                "major damage", "large damage", "serious damage",
                "severe damage", "cannot use the road",
                "road cannot be used", "cannot use the water",
                "cannot use the facility", "completely blocked",
                "road is blocked", "street is blocked",
                "completely unusable", "not usable", "unsafe to use");

        highScore += scoreWords(fullText, 2,
                "severe", "serious", "major", "huge", "large",
                "dangerous", "unsafe", "urgent", "blocked", "unusable");

        highScore += scorePhrases(fullText, 5,
                "entire area", "whole area", "entire locality",
                "whole locality", "entire neighborhood",
                "whole neighborhood", "entire colony", "whole colony",
                "entire street", "whole street", "many residents",
                "many people", "many families", "all residents",
                "everyone is affected", "public is affected",
                "people are affected", "many households",
                "entire community");

        highScore += scorePhrases(fullText, 4,
                "near school", "near a school", "in school",
                "near hospital", "near a hospital", "in hospital",
                "near college", "near a college", "near bus stand",
                "near bus stop", "near railway station", "near temple",
                "near market", "near main road", "on main road",
                "main junction", "busy road", "crowded area",
                "public place");

        if (containsAny(fullText,
                "since morning", "since yesterday",
                "since last night", "since afternoon",
                "since evening", "for hours", "many hours",
                "all day", "whole day")) {
            mediumScore += 2;
        }

        if (containsAny(fullText,
                "for two days", "for 2 days",
                "for three days", "for 3 days",
                "for four days", "for 4 days",
                "for five days", "for 5 days",
                "for several days", "for many days",
                "from many days", "since many days",
                "for a week", "for one week",
                "for several weeks", "for weeks", "for months",
                "since last week", "since last month")) {
            highScore += 4;
        }

        if (containsAny(fullText,
                "every day", "daily", "again and again",
                "keeps happening", "happens repeatedly",
                "repeatedly", "continuously", "all the time",
                "regularly happening", "keeps leaking",
                "keeps overflowing", "keeps breaking")) {
            mediumScore += 2;
        }

        if (containsAny(fullText,
                "please come immediately", "please fix immediately",
                "please repair immediately", "please solve immediately",
                "take immediate action", "action is urgently required",
                "urgent action required", "please send someone",
                "please send help", "help is needed immediately")) {
            highScore += 3;
        }

        mediumScore += scorePhrases(fullText, 2,
                "not working", "does not work", "doesn't work",
                "not functioning", "needs repair", "need repair",
                "needs fixing", "need fixing", "needs cleaning",
                "need cleaning", "needs maintenance", "need maintenance",
                "poor condition", "small leak", "minor leakage",
                "street light not working", "streetlight not working",
                "light is not working", "broken streetlight",
                "broken street light", "streetlight is broken",
                "street light is broken", "streetlight broken",
                "street light broken", "broken road light",
                "road light is broken", "road light not working",
                "lamp post is broken", "lamp post broken");

        int routineScore = 0;

        routineScore += scorePhrases(fullText, 2,
                "needs trimming", "need trimming",
                "grass needs cutting", "grass needs trimming",
                "plants need trimming", "tree branches need trimming",
                "routine maintenance", "regular maintenance",
                "minor cleaning", "small cleaning issue",
                "cosmetic repair");

        routineScore += scoreWords(fullText, 1,
                "minor", "small", "routine", "trimming", "maintenance");

        if (containsAny(fullText,
                "children", "elderly people", "old people",
                "patients", "students", "residents", "families")) {
            mediumScore += 1;
        }

        if (criticalScore >= 10) {
            return "CRITICAL";
        }

        if (criticalScore >= 5
                && (highScore >= 5 || mediumScore >= 4)) {
            return "CRITICAL";
        }

        if (highScore >= 7) {
            return "HIGH";
        }

        if (highScore >= 4 && mediumScore >= 3) {
            return "HIGH";
        }

        if (mediumScore > 0 || highScore > 0) {
            return "MEDIUM";
        }

        if (routineScore > 0) {
            return "LOW";
        }

        return "LOW";
    }

    // =========================================================
    // AUTOMATIC DEPARTMENT ALLOCATION
    // =========================================================

    private void allocateDepartment(Complaint complaint) {

        if (complaint.getCategory() == null
                || complaint.getCategory().trim().isEmpty()) {
            return;
        }

        String category = complaint.getCategory().trim().toUpperCase();
        List<Department> departments = departmentRepository.findAll();

        if (departments == null || departments.isEmpty()) {
            return;
        }

        for (Department department : departments) {

            if (department == null) {
                continue;
            }

            String departmentName = getDepartmentName(department);

            if (departmentName == null || departmentName.trim().isEmpty()) {
                continue;
            }

            String normalizedName = departmentName.trim().toUpperCase();

            if ("WATER".equals(category)
                    && containsAny(normalizedName,
                            "WATER DEPARTMENT", "WATER SUPPLY", "WATER")) {
                complaint.setDepartment(department);
                return;
            }

            if ("ROADS".equals(category)
                    && containsAny(normalizedName,
                            "ROAD DEPARTMENT", "ROADS DEPARTMENT",
                            "PUBLIC WORKS", "PWD")) {
                complaint.setDepartment(department);
                return;
            }

            if ("SANITATION".equals(category)
                    && containsAny(normalizedName,
                            "SANITATION DEPARTMENT", "SANITATION",
                            "SOLID WASTE")) {
                complaint.setDepartment(department);
                return;
            }

            if ("ELECTRICITY".equals(category)
                    && containsAny(normalizedName,
                            "ELECTRICITY DEPARTMENT", "ELECTRICITY",
                            "ELECTRIC", "POWER")) {
                complaint.setDepartment(department);
                return;
            }

            if ("PARKS".equals(category)
                    && containsAny(normalizedName,
                            "PARKS", "HORTICULTURE", "GARDEN")) {
                complaint.setDepartment(department);
                return;
            }
        }
    }

    private String getDepartmentName(Department department) {
        try {
            return department.getName();
        } catch (Exception e) {
            return "";
        }
    }

    // =========================================================
    // VALIDATE COMPLAINT
    // =========================================================

    private void validateComplaint(Complaint complaint) {

        if (complaint.getTitle() == null
                || complaint.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint title is required");
        }

        if (complaint.getDescription() == null
                || complaint.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint description is required");
        }

        if (complaint.getLocation() == null
                || complaint.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint location is required");
        }
    }

    // =========================================================
    // AUTOMATIC CATEGORY
    // =========================================================

    private String categorizeComplaint(Complaint complaint) {

        String title = normalizeText(complaint.getTitle());
        String description = normalizeText(complaint.getDescription());
        String fullText = title + " " + description;

        int waterScore = 0;
        int roadScore = 0;
        int sanitationScore = 0;
        int electricityScore = 0;
        int parksScore = 0;

        waterScore += scorePhrases(title, 6,
                "no water", "water supply", "water shortage",
                "water problem", "drinking water", "tap water",
                "water leakage", "water leak", "pipe burst",
                "broken pipeline");

        waterScore += scorePhrases(description, 3,
                "water supply", "water shortage", "no water",
                "water leakage", "water leak", "pipe burst",
                "broken pipe", "pipeline", "tap water",
                "water pressure", "drinking water");

        waterScore += scoreWords(description, 1,
                "water", "tap", "pipeline", "pipe", "leakage");

        roadScore += scorePhrases(title, 6,
                "road damage", "damaged road", "road repair",
                "road condition", "broken road", "damaged pavement",
                "broken pavement", "footpath damaged",
                "sidewalk damaged", "pothole", "potholes");

        roadScore += scorePhrases(description, 3,
                "road damage", "damaged road", "road repair",
                "road condition", "broken road", "road surface",
                "damaged pavement", "broken pavement", "footpath",
                "sidewalk", "pothole", "potholes", "vehicle damage");

        roadScore += scoreWords(description, 1,
                "pothole", "potholes", "footpath",
                "sidewalk", "pavement", "asphalt");

        roadScore += scoreWords(fullText, 1, "road", "street");

        sanitationScore += scorePhrases(title, 7,
                "garbage overflow", "garbage overflowing",
                "overflowing garbage", "overflowing bins",
                "garbage collection", "waste collection",
                "uncollected garbage", "uncollected waste",
                "foul smell", "bad smell", "waste dumping",
                "garbage dumping", "open garbage", "dirty area",
                "waste management");

        sanitationScore += scorePhrases(description, 4,
                "garbage overflow", "garbage overflowing",
                "overflowing garbage", "overflowing bins",
                "garbage collection", "waste collection",
                "uncollected garbage", "uncollected waste",
                "foul smell", "bad smell", "waste dumping",
                "garbage dumping", "open garbage", "dirty area",
                "waste management", "solid waste", "cleaning required");

        sanitationScore += scoreWords(description, 2,
                "garbage", "waste", "dustbin", "dustbins",
                "trash", "litter", "cleanliness", "hygiene",
                "dumping", "unclean", "dirty");

        sanitationScore += scoreWords(fullText, 3,
                "overflowing", "uncollected", "smell", "foul");

        electricityScore += scorePhrases(title, 8,
                "power outage", "power cut", "electricity outage",
                "electricity problem", "street light", "streetlight",
                "streetlamp", "street lamp", "street light not working",
                "streetlight not working", "broken streetlight",
                "broken street light", "streetlight is broken",
                "street light is broken", "streetlamp is broken",
                "broken streetlamp", "lamp post",
                "lamp post is broken", "electric pole", "electric wire");

        electricityScore += scorePhrases(description, 5,
                "power outage", "power cut", "electricity outage",
                "street light", "streetlight", "streetlamp",
                "street lamp", "street light not working",
                "streetlight not working", "broken streetlight",
                "broken street light", "streetlight is broken",
                "street light is broken", "streetlamp is broken",
                "broken streetlamp", "lamp post",
                "lamp post is broken", "electric pole",
                "electric wire", "voltage problem");

        electricityScore += scoreWords(description, 2,
                "electricity", "electric", "streetlight",
                "streetlamp", "lamp", "power", "transformer",
                "voltage", "wire");

        if (containsAny(fullText,
                "streetlight", "street light", "streetlamp",
                "street lamp", "lamp post", "road light",
                "public lighting")) {
            electricityScore += 10;
        }

        parksScore += scorePhrases(title, 6,
                "public park", "park maintenance", "garden maintenance",
                "tree maintenance", "overgrown trees",
                "overgrown plants", "overgrown grass", "fallen tree",
                "tree fallen", "park cleaning");

        parksScore += scorePhrases(description, 3,
                "public park", "park maintenance", "garden maintenance",
                "tree maintenance", "overgrown trees",
                "overgrown plants", "overgrown grass", "fallen tree",
                "tree fallen", "park cleaning", "playground");

        parksScore += scoreWords(description, 1,
                "park", "garden", "tree", "trees", "plant",
                "plants", "grass", "horticulture", "playground");

        int highestScore = Math.max(
                waterScore,
                Math.max(
                        roadScore,
                        Math.max(
                                sanitationScore,
                                Math.max(electricityScore, parksScore))));

        if (highestScore == 0) {
            return "OTHER";
        }

        if (electricityScore == highestScore
                && containsAny(fullText,
                        "streetlight", "street light", "streetlamp",
                        "street lamp", "lamp post", "road light",
                        "public lighting")) {
            return "ELECTRICITY";
        }

        if (sanitationScore == highestScore) {
            return "SANITATION";
        }

        if (waterScore == highestScore) {
            return "WATER";
        }

        if (electricityScore == highestScore) {
            return "ELECTRICITY";
        }

        if (roadScore == highestScore) {
            return "ROADS";
        }

        if (parksScore == highestScore) {
            return "PARKS";
        }

        return "OTHER";
    }

    // =========================================================
    // TEXT UTILITIES
    // =========================================================

    private String normalizeText(String text) {

        if (text == null) {
            return "";
        }

        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private int scorePhrases(String text, int score, String... phrases) {

        if (text == null || text.isEmpty()) {
            return 0;
        }

        int total = 0;

        for (String phrase : phrases) {
            if (text.contains(phrase)) {
                total += score;
            }
        }

        return total;
    }

    private int scoreWords(String text, int score, String... words) {

        if (text == null || text.isEmpty()) {
            return 0;
        }

        int total = 0;

        for (String word : words) {
            if (containsWholeWord(text, word)) {
                total += score;
            }
        }

        return total;
    }

    private boolean containsWholeWord(String text, String word) {

        String normalizedWord = normalizeText(word);
        String[] words = text.split("\\s+");

        for (String currentWord : words) {
            if (currentWord.equals(normalizedWord)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsAny(String text, String... keywords) {

        if (text == null) {
            return false;
        }

        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    // =========================================================
    // DUPLICATE DETECTION
    // =========================================================

    private void checkForDuplicate(Complaint complaint) {

        if (complaint.getLatitude() == null
                || complaint.getLongitude() == null) {
            complaint.setDuplicate(false);
            complaint.setDuplicateOf(null);
            return;
        }

        List<Complaint> complaints = complaintRepository.findAll();

        for (Complaint existing : complaints) {

            if (existing.getId() != null
                    && complaint.getId() != null
                    && existing.getId().equals(complaint.getId())) {
                continue;
            }

            if (existing.getLatitude() == null
                    || existing.getLongitude() == null) {
                continue;
            }

            if ("CLOSED".equalsIgnoreCase(existing.getStatus())) {
                continue;
            }

            String currentCategory = normalizeText(complaint.getCategory());
            String existingCategory = normalizeText(existing.getCategory());

            if (currentCategory.isEmpty()
                    || existingCategory.isEmpty()
                    || !currentCategory.equals(existingCategory)) {
                continue;
            }

            double latitudeDifference = Math.abs(
                    existing.getLatitude() - complaint.getLatitude());

            double longitudeDifference = Math.abs(
                    existing.getLongitude() - complaint.getLongitude());

            if (latitudeDifference >= 0.0007
                    || longitudeDifference >= 0.0007) {
                continue;
            }

            String existingText = normalizeText(
                    safeText(existing.getTitle()) + " "
                            + safeText(existing.getDescription()));

            String currentText = normalizeText(
                    safeText(complaint.getTitle()) + " "
                            + safeText(complaint.getDescription()));

            if (similarText(existingText, currentText)) {

                complaint.setDuplicate(true);

                if (existing.getDuplicateOf() != null) {
                    complaint.setDuplicateOf(existing.getDuplicateOf());
                } else {
                    complaint.setDuplicateOf(existing.getId());
                }

                return;
            }
        }

        complaint.setDuplicate(false);
        complaint.setDuplicateOf(null);
    }

    private String safeText(String text) {
        return text == null ? "" : text;
    }

    private boolean similarText(String first, String second) {

        if (first == null || second == null
                || first.trim().isEmpty()
                || second.trim().isEmpty()) {
            return false;
        }

        Set<String> firstWords = getMeaningfulWords(first);
        Set<String> secondWords = getMeaningfulWords(second);

        if (firstWords.isEmpty() || secondWords.isEmpty()) {
            return false;
        }

        Set<String> commonWords = new HashSet<>(firstWords);
        commonWords.retainAll(secondWords);

        int commonCount = commonWords.size();
        int smallerSize = Math.min(firstWords.size(), secondWords.size());

        if (smallerSize == 0 || commonCount < 2) {
            return false;
        }

        double similarity = (double) commonCount / smallerSize;

        if (smallerSize <= 3) {
            return similarity >= 0.60;
        }

        return similarity >= 0.40;
    }

    private Set<String> getMeaningfulWords(String text) {

        Set<String> meaningfulWords = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return meaningfulWords;
        }

        String normalized = normalizeText(text);
        String[] words = normalized.split("\\s+");

        Set<String> stopWords = Set.of(
                "the", "a", "an", "and", "or", "is", "are",
                "was", "were", "has", "have", "had", "to",
                "of", "in", "on", "at", "for", "from", "near",
                "our", "my", "me", "we", "they", "their",
                "this", "that", "there", "here", "please",
                "kindly", "request", "requested", "need",
                "needs", "needed", "issue", "problem",
                "complaint", "area", "place", "road", "street");

        for (String word : words) {

            if (word.length() < 4 || stopWords.contains(word)) {
                continue;
            }

            String normalizedWord = normalizeMeaningfulWord(word);

            if (!normalizedWord.isEmpty()) {
                meaningfulWords.add(normalizedWord);
            }
        }

        return meaningfulWords;
    }

    private String normalizeMeaningfulWord(String word) {

        if (word == null || word.isEmpty()) {
            return "";
        }

        String normalized = word.toLowerCase().trim();

        switch (normalized) {
            case "streetlight", "streetlamp",
                    "streetlights", "streetlamps" -> {
                return "streetlight";
            }
            case "broken", "breaking", "broke" -> {
                return "break";
            }
            case "damaged", "damaging" -> {
                return "damage";
            }
            case "leakage", "leaking", "leaks" -> {
                return "leak";
            }
            case "garbage", "trash", "rubbish", "litter" -> {
                return "garbage";
            }
            case "waste" -> {
                return "waste";
            }
            case "overflowing", "overflowed", "overflows" -> {
                return "overflow";
            }
            case "potholes" -> {
                return "pothole";
            }
            case "sidewalks" -> {
                return "sidewalk";
            }
            case "gardens" -> {
                return "garden";
            }
            case "trees" -> {
                return "tree";
            }
            case "plants" -> {
                return "plant";
            }
            case "lights" -> {
                return "light";
            }
            default -> {
            }
        }

        if (normalized.endsWith("ing") && normalized.length() > 5) {
            normalized = normalized.substring(0, normalized.length() - 3);
        }

        if (normalized.endsWith("ed") && normalized.length() > 5) {
            normalized = normalized.substring(0, normalized.length() - 2);
        }

        if (normalized.endsWith("es") && normalized.length() > 5) {
            normalized = normalized.substring(0, normalized.length() - 2);
        }

        if (normalized.endsWith("s") && normalized.length() > 4) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }

    // =========================================================
    // IMAGE UPLOAD
    // =========================================================

    private String saveImage(MultipartFile image) {

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = image.getOriginalFilename();
            String extension = "";

            if (originalFilename != null
                    && originalFilename.contains(".")) {
                extension = originalFilename.substring(
                        originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(image.getInputStream(), filePath);

            return "/uploads/complaints/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save complaint image", e);
        }
    }

    // =========================================================
    // GET ALL COMPLAINTS
    // =========================================================

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // =========================================================
    // GET COMPLAINTS BY USER
    // =========================================================

    public List<Complaint> getComplaintsByUserId(Long userId) {

        if (userId == null) {
            return List.of();
        }

        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // =========================================================
    // GET SINGLE COMPLAINT
    // =========================================================

    public Complaint getComplaintById(Long id) {

        if (id == null) {
            throw new RuntimeException("Complaint ID is required");
        }

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found with ID: " + id));
    }

    // =========================================================
    // UPDATE STATUS + EMAIL NOTIFICATION
    // =========================================================

    public Complaint updateComplaintStatus(Long id, String status) {

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        Complaint complaint = getComplaintById(id);

        String previousStatus = normalizeStatusForComparison(
                complaint.getStatus());

        String newStatus = normalizeStatus(status);

        if (!Set.of(
                "SUBMITTED",
                "PENDING",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED"
        ).contains(newStatus)) {
            throw new IllegalArgumentException(
                    "Invalid complaint status: " + newStatus);
        }

        // Update the entity status.
        complaint.setStatus(newStatus);

        // Set timestamps only once when the corresponding status is reached.
        if ("RESOLVED".equals(newStatus)
                && complaint.getResolvedAt() == null) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        if ("CLOSED".equals(newStatus)
                && complaint.getClosedAt() == null) {
            complaint.setClosedAt(LocalDateTime.now());
        }

        // Persist the status change before sending an email.
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Confirm that the saved entity contains the expected status.
        String savedStatus = normalizeStatusForComparison(
                savedComplaint.getStatus());

        if (!newStatus.equals(savedStatus)) {
            throw new RuntimeException(
                    "Complaint status was not updated correctly. Expected "
                            + newStatus + " but received " + savedStatus);
        }

        // Send email only when the status actually changes.
        if (!newStatus.equals(previousStatus)) {

            if ("IN_PROGRESS".equals(newStatus)) {
                emailService.sendInProgressEmail(savedComplaint);

            } else if ("RESOLVED".equals(newStatus)) {
                emailService.sendResolvedEmail(savedComplaint);
            }
        }

        return savedComplaint;
    }

    private String normalizeStatusForComparison(String status) {

        if (status == null || status.trim().isEmpty()) {
            return "";
        }

        return status.trim()
                .toUpperCase()
                .replaceAll("[\\s-]+", "_");
    }

    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    public Complaint updateComplaintImage(Long id, String imagePath) {

        Complaint complaint = getComplaintById(id);
        complaint.setImagePath(imagePath);

        return complaintRepository.save(complaint);
    }

    // =========================================================
    // ADD RESOLUTION + EMAIL NOTIFICATION
    // =========================================================

    public Complaint addResolution(Long id, String description) {

        Complaint complaint = getComplaintById(id);

        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Resolution description is required");
        }

        String previousStatus = normalizeStatusForComparison(
                complaint.getStatus());

        complaint.setResolutionDescription(description);
        complaint.setResolvedAt(LocalDateTime.now());
        complaint.setStatus("RESOLVED");

        Complaint savedComplaint = complaintRepository.save(complaint);

        if (!"RESOLVED".equals(previousStatus)) {
            emailService.sendResolvedEmail(savedComplaint);
        }

        return savedComplaint;
    }

    // =========================================================
    // VERIFY RESOLUTION
    // =========================================================

    public Complaint verifyResolution(Long id, Boolean verified) {

        Complaint complaint = getComplaintById(id);
        complaint.setCitizenVerified(verified);

        if (Boolean.TRUE.equals(verified)) {

            complaint.setStatus("CLOSED");

            if (complaint.getClosedAt() == null) {
                complaint.setClosedAt(LocalDateTime.now());
            }
        }

        return complaintRepository.save(complaint);
    }

    // =========================================================
    // ASSIGN DEPARTMENT
    // =========================================================

    public Complaint assignDepartment(
            Long complaintId,
            Long departmentId) {

        Complaint complaint = getComplaintById(complaintId);

        Department department = departmentRepository
                .findById(departmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with ID: " + departmentId));

        complaint.setDepartment(department);

        return complaintRepository.save(complaint);
    }

    // =========================================================
    // FILTER BY STATUS
    // =========================================================

    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatus(status);
    }

    // =========================================================
    // FILTER BY CATEGORY
    // =========================================================

    public List<Complaint> getComplaintsByCategory(String category) {
        return complaintRepository.findByCategory(category);
    }

    // =========================================================
    // GET BY LOCATION
    // =========================================================

    public List<Complaint> getComplaintsByLocation(String location) {
        return complaintRepository.findByLocation(location);
    }

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    public List<Complaint> getComplaintsByDepartment(Long departmentId) {
        return complaintRepository.findByDepartmentId(departmentId);
    }

    // =========================================================
    // STATISTICS
    // =========================================================

    public long getTotalComplaints() {
        return complaintRepository.count();
    }

    public long getSubmittedComplaints() {
        return complaintRepository.countByStatus("SUBMITTED");
    }

    public long getResolvedComplaints() {
        return complaintRepository.countByStatus("RESOLVED");
    }

    public long getClosedComplaints() {
        return complaintRepository.countByStatus("CLOSED");
    }

    public long getPendingComplaints() {
        return complaintRepository.countByStatus("PENDING");
    }

    public long getDuplicateComplaints() {
        return complaintRepository.countByDuplicateTrue();
    }

    public long getComplaintsByCategoryCount(String category) {
        return complaintRepository.countByCategory(category);
    }

    public long getComplaintsByDepartmentCount(Long departmentId) {
        return complaintRepository.countByDepartmentId(departmentId);
    }

    // =========================================================
    // CITIZEN STATISTICS
    // =========================================================

    public long getCitizenComplaintCount(Long userId) {
        return complaintRepository.countByUserId(userId);
    }

    public long getCitizenComplaintCountByStatus(
            Long userId,
            String status) {

        return complaintRepository.countByUserIdAndStatus(userId, status);
    }
}