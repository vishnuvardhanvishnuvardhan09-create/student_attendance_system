package com.attendance.system.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class FacultyMarkAttendanceRequest {

    @NotNull(message = "Student ID is required")
    @JsonAlias({"student_id", "studentId"})
    private Integer studentId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank(message = "Status is required (Present, Absent, Late)")
    private String status;

    @JsonFormat(pattern = "HH:mm[:ss]")
    @JsonAlias({"time_in", "timeIn"})
    private LocalTime timeIn;

    @JsonAlias({"marked_by", "markedBy"})
    private String markedBy; // Defaults to "faculty"

    public FacultyMarkAttendanceRequest() {
    }

    public FacultyMarkAttendanceRequest(Integer studentId, LocalDate date, String status, LocalTime timeIn, String markedBy) {
        this.studentId = studentId;
        this.date = date;
        this.status = status;
        this.timeIn = timeIn;
        this.markedBy = markedBy;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getTimeIn() {
        return timeIn;
    }

    public void setTimeIn(LocalTime timeIn) {
        this.timeIn = timeIn;
    }

    public String getMarkedBy() {
        return markedBy;
    }

    public void setMarkedBy(String markedBy) {
        this.markedBy = markedBy;
    }
}
