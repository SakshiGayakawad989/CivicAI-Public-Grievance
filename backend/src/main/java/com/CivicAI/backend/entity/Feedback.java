package com.CivicAI.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @OneToOne
    @JoinColumn(
            name = "complaint_id",
            unique = true,
            nullable = false
    )
    private Complaint complaint;


    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // =========================================================
    // RATING
    // =========================================================

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }


    // =========================================================
    // COMMENT
    // =========================================================

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }


    // =========================================================
    // COMPLAINT
    // =========================================================

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(
            Complaint complaint) {

        this.complaint = complaint;
    }
}