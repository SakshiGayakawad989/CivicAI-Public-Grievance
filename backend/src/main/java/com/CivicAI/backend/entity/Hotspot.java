
package com.CivicAI.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "hotspots")
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;

    private Double latitude;

    private Double longitude;

    private Long complaintCount;

    // Complaint category, if needed
    private String category;

    // Hotspot severity: HIGH, MEDIUM, or LOW
    private String severity;

    // Complaint IDs are not stored in the database
    @Transient
    private List<Long> complaintIds = new ArrayList<>();

    // Default constructor required by JPA
    public Hotspot() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Long getComplaintCount() {
        return complaintCount;
    }

    public void setComplaintCount(Long complaintCount) {
        this.complaintCount = complaintCount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public List<Long> getComplaintIds() {
        return complaintIds;
    }

    public void setComplaintIds(List<Long> complaintIds) {
        this.complaintIds = complaintIds != null
                ? complaintIds
                : new ArrayList<>();
    }
}
