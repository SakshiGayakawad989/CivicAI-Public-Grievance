package com.CivicAI.backend.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // =========================================================
    // 1. SUBMIT COMPLAINT
    // =========================================================

    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(
            @RequestBody Complaint complaint) {

        Complaint savedComplaint =
                complaintService.submitComplaint(complaint);

        return ResponseEntity.ok(savedComplaint);
    }

    // =========================================================
    // 2. GET ALL COMPLAINTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // =========================================================
    // 3. COMPLAINT STATISTICS
    // =========================================================

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getComplaintStatistics() {

        Map<String, Long> statistics =
                new LinkedHashMap<>();

        statistics.put(
                "total",
                (long) complaintService
                        .getAllComplaints()
                        .size()
        );

        statistics.put(
                "submitted",
                complaintService.getSubmittedCount()
        );

        statistics.put(
                "inProgress",
                complaintService.getInProgressCount()
        );

        statistics.put(
                "resolved",
                complaintService.getResolvedCount()
        );

        statistics.put(
                "duplicates",
                complaintService.getDuplicateCount()
        );

        return ResponseEntity.ok(statistics);
    }

    // =========================================================
    // 4. FILTER BY STATUS
    // =========================================================

    @GetMapping("/filter/status")
    public ResponseEntity<List<Complaint>> getComplaintsByStatus(
            @RequestParam String status) {

        return ResponseEntity.ok(
                complaintService.getComplaintsByStatus(status)
        );
    }

    // =========================================================
    // 5. FILTER BY CATEGORY
    // =========================================================

    @GetMapping("/filter/category")
    public ResponseEntity<List<Complaint>> getComplaintsByCategory(
            @RequestParam String category) {

        return ResponseEntity.ok(
                complaintService.getComplaintsByCategory(category)
        );
    }

    // =========================================================
    // 6. FILTER BY DEPARTMENT
    // =========================================================

    @GetMapping("/filter/department")
    public ResponseEntity<List<Complaint>> getComplaintsByDepartment(
            @RequestParam Long departmentId) {

        return ResponseEntity.ok(
                complaintService.getComplaintsByDepartment(
                        departmentId
                )
        );
    }

    // =========================================================
    // 7. GET COMPLAINT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id) {

        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // 8. ASSIGN DEPARTMENT
    // =========================================================

    @PutMapping("/{complaintId}/department/{departmentId}")
    public ResponseEntity<Complaint> assignDepartment(
            @PathVariable Long complaintId,
            @PathVariable Long departmentId) {

        Complaint complaint =
                complaintService.assignDepartment(
                        complaintId,
                        departmentId
                );

        return ResponseEntity.ok(complaint);
    }

    // =========================================================
    // 9. UPDATE STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Complaint updatedComplaint =
                complaintService.updateStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(updatedComplaint);
    }

    // =========================================================
    // 10. ADD IMAGE
    // =========================================================

    @PutMapping("/{complaintId}/image")
    public ResponseEntity<Complaint> addImageToComplaint(
            @PathVariable Long complaintId,
            @RequestParam String imagePath) {

        Complaint complaint =
                complaintService
                        .getComplaintById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"
                                ));

        complaint.setImagePath(imagePath);

        Complaint updatedComplaint =
                complaintService.saveComplaint(complaint);

        return ResponseEntity.ok(updatedComplaint);
    }
}