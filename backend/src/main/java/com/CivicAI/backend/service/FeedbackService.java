package com.CivicAI.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.entity.Feedback;
import com.CivicAI.backend.repository.ComplaintRepository;
import com.CivicAI.backend.repository.FeedbackRepository;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            ComplaintRepository complaintRepository) {

        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
    }


    // =========================================================
    // SUBMIT FEEDBACK
    // =========================================================

    public Feedback submitFeedback(
            Long complaintId,
            Feedback feedback) {

        Complaint complaint =
                complaintRepository
                        .findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"
                                ));


        // Feedback only after resolution
        if (!"RESOLVED".equalsIgnoreCase(
                complaint.getStatus())) {

            throw new RuntimeException(
                    "Feedback can be submitted only for resolved complaints"
            );
        }


        // Only one feedback
        if (feedbackRepository
                .existsByComplaintId(
                        complaintId)) {

            throw new RuntimeException(
                    "Feedback already submitted for this complaint"
            );
        }


        // Rating required
        if (feedback.getRating() == null) {

            throw new RuntimeException(
                    "Rating is required"
            );
        }


        // Rating range
        if (feedback.getRating() < 1 ||
                feedback.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }


        feedback.setComplaint(complaint);

        return feedbackRepository.save(
                feedback
        );
    }


    // =========================================================
    // GET FEEDBACK BY ID
    // =========================================================

    public Optional<Feedback> getFeedbackById(
            Long id) {

        return feedbackRepository.findById(id);
    }


    // =========================================================
    // GET FEEDBACK BY COMPLAINT
    // =========================================================

    public Optional<Feedback>
            getFeedbackByComplaint(
                    Long complaintId) {

        return feedbackRepository
                .findByComplaintId(
                        complaintId
                );
    }


    // =========================================================
    // GET ALL FEEDBACK
    // =========================================================

    public List<Feedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }
}