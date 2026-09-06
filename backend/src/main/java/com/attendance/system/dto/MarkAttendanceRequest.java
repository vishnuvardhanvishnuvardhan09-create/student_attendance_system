package com.attendance.system.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class MarkAttendanceRequest {

    @NotNull(message = "Student ID is required")
    @JsonAlias({"student_id", "studentId"})
    private Integer studentId;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String status; // Optional client-reported status, e.g. "Present"

    public MarkAttendanceRequest() {
    }

    public MarkAttendanceRequest(Integer studentId, BigDecimal latitude, BigDecimal longitude, String status) {
        this.studentId = studentId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
