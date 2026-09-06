package com.attendance.system.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Holiday entity representing institution holidays and closures.
 */
@Entity
@Table(name = "holidays")
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "holiday_id")
    private Integer holidayId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "added_by_admin_id")
    private Admin addedByAdmin;

    public Holiday() {
    }

    public Holiday(LocalDate date, String title, String description, Admin addedByAdmin) {
        this.date = date;
        this.title = title;
        this.description = description;
        this.addedByAdmin = addedByAdmin;
    }

    public Integer getHolidayId() {
        return holidayId;
    }

    public void setHolidayId(Integer holidayId) {
        this.holidayId = holidayId;
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

    public Admin getAddedByAdmin() {
        return addedByAdmin;
    }

    public void setAddedByAdmin(Admin addedByAdmin) {
        this.addedByAdmin = addedByAdmin;
    }
}
