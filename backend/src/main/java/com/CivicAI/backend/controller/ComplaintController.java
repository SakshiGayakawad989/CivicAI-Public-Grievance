
package com.CivicAI.backend.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5174")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // SUBMIT COMPLAINT - JSON
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Complaint> submitComplaint(
            @RequestBody Complaint complaint,
            @RequestParam(value = "userId", required = false) Long userId) {

        Complaint savedComplaint =
                complaintService.submitComplaint(complaint, userId);

        return ResponseEntity.ok(savedComplaint);
    }

    // SUBMIT COMPLAINT - MULTIPART / IMAGE
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Complaint> submitMultipartComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setLocation(location);
        complaint.setLatitude(latitude);
        complaint.setLongitude(longitude);

        Complaint savedComplaint =
                complaintService.submitMultipartComplaint(
                        complaint, userId, image);

        return ResponseEntity.ok(savedComplaint);
    }

    // GET ALL COMPLAINTS OR COMPLAINTS BY USER
    @GetMapping
    public ResponseEntity<List<Complaint>> getComplaints(
            @RequestParam(value = "userId", required = false) Long userId) {

        if (userId != null) {
            return ResponseEntity.ok(
                    complaintService.getComplaintsByUserId(userId));
        }

        return ResponseEntity.ok(
                complaintService.getAllComplaints());
    }

    // GET COMPLAINT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id));
    }

    // UPDATE COMPLAINT STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Complaint updatedComplaint =
                complaintService.updateComplaintStatus(id, status);

        return ResponseEntity.ok(updatedComplaint);
    }

    // ASSIGN DEPARTMENT
    @PutMapping("/{id}/department/{departmentId}")
    public ResponseEntity<Complaint> assignDepartment(
            @PathVariable Long id,
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                complaintService.assignDepartment(id, departmentId));
    }

    // ADD RESOLUTION
    @PutMapping("/{id}/resolution")
    public ResponseEntity<Complaint> addResolution(
            @PathVariable Long id,
            @RequestParam String description) {

        return ResponseEntity.ok(
                complaintService.addResolution(id, description));
    }

    // VERIFY RESOLUTION
    @PutMapping("/{id}/verify")
    public ResponseEntity<Complaint> verifyResolution(
            @PathVariable Long id,
            @RequestParam Boolean verified) {

        return ResponseEntity.ok(
                complaintService.verifyResolution(id, verified));
    }

    // UPDATE IMAGE PATH
    @PutMapping("/{id}/image")
    public ResponseEntity<Complaint> updateImage(
            @PathVariable Long id,
            @RequestParam String imagePath) {

        return ResponseEntity.ok(
                complaintService.updateComplaintImage(id, imagePath));
    }

    // STATISTICS
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {

        Map<String, Object> statistics = new LinkedHashMap<>();

        statistics.put(
                "total",
                complaintService.getAllComplaints().size());

        return ResponseEntity.ok(statistics);
    }
}
