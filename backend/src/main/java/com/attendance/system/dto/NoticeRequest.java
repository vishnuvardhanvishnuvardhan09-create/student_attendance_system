package com.attendance.system.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class NoticeRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @JsonAlias({"posted_by_faculty_id", "postedByFacultyId"})
    private Integer postedByFacultyId;

    @JsonAlias({"target_audience", "targetAudience"})
    private String targetAudience; // All, Specific Year, Specific Section

    public NoticeRequest() {
    }

    public NoticeRequest(String title, String message, Integer postedByFacultyId, String targetAudience) {
        this.title = title;
        this.message = message;
        this.postedByFacultyId = postedByFacultyId;
        this.targetAudience = targetAudience;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getPostedByFacultyId() {
        return postedByFacultyId;
    }

    public void setPostedByFacultyId(Integer postedByFacultyId) {
        this.postedByFacultyId = postedByFacultyId;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
