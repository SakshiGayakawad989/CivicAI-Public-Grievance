package com.CivicAI.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CivicAI.backend.entity.Complaint;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // =========================================================
    // FIND COMPLAINTS BY LOCATION
    // =========================================================

    List<Complaint> findByLocation(String location);

    // =========================================================
    // FIND COMPLAINTS BY STATUS
    // =========================================================

    List<Complaint> findByStatus(String status);

    // =========================================================
    // FIND COMPLAINTS BY CATEGORY
    // =========================================================

    List<Complaint> findByCategory(String category);

    // =========================================================
    // FIND COMPLAINTS BY DEPARTMENT
    // =========================================================

    List<Complaint> findByDepartmentId(Long departmentId);

    // =========================================================
    // FIND COMPLAINTS BY CITIZEN / USER
    // =========================================================

    List<Complaint> findByUserId(Long userId);

    // =========================================================
    // FIND CITIZEN COMPLAINTS - LATEST FIRST
    // =========================================================

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    // =========================================================
    // COMPLAINT STATISTICS
    // =========================================================

    long countByStatus(String status);

    long countByDuplicateTrue();

    long countByCategory(String category);

    long countByDepartmentId(Long departmentId);

    // =========================================================
    // CITIZEN-SPECIFIC STATISTICS
    // =========================================================

    long countByUserId(Long userId);

    long countByUserIdAndStatus(
            Long userId,
            String status);
}