package com.CivicAI.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CivicAI.backend.entity.Feedback;
import com.CivicAI.backend.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5174")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // =========================================================
    // SUBMIT FEEDBACK
    // =========================================================

    @PostMapping("/complaint/{complaintId}")
    public ResponseEntity<Feedback> submitFeedback(
            @PathVariable Long complaintId,
            @RequestBody Feedback feedback) {

        Feedback savedFeedback =
                feedbackService.submitFeedback(
                        complaintId,
                        feedback
                );

        return ResponseEntity.ok(savedFeedback);
    }

    // =========================================================
    // GET ALL FEEDBACK
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {

        return ResponseEntity.ok(
                feedbackService.getAllFeedback()
        );
    }

    // =========================================================
    // GET FEEDBACK BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(
            @PathVariable Long id) {

        return feedbackService
                .getFeedbackById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // GET FEEDBACK FOR COMPLAINT
    // =========================================================

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<Feedback> getFeedbackByComplaint(
            @PathVariable Long complaintId) {

        return feedbackService
                .getFeedbackByComplaint(complaintId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}