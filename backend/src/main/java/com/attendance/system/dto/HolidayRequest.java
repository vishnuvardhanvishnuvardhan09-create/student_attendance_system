package com.attendance.system.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class HolidayRequest {

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @JsonAlias({"added_by_admin_id", "addedByAdminId"})
    private Integer addedByAdminId;

    public HolidayRequest() {
    }

    public HolidayRequest(LocalDate date, String title, String description, Integer addedByAdminId) {
        this.date = date;
        this.title = title;
        this.description = description;
        this.addedByAdminId = addedByAdminId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getAddedByAdminId() {
        return addedByAdminId;
    }

    public void setAddedByAdminId(Integer addedByAdminId) {
        this.addedByAdminId = addedByAdminId;
    }
}
