package com.CivicAI.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.CivicAI.backend.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByComplaintId(Long complaintId);

    boolean existsByComplaintId(Long complaintId);
}