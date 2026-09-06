package com.attendance.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Faculty entity representing college teaching staff and professors.
 * Note: passwordPlain is stored in plain text for academic/demo purposes.
 */
@Entity
@Table(name = "faculty")
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_id")
    private Integer facultyId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_plain", nullable = false, length = 255)
    private String passwordPlain;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Faculty() {
    }

    public Faculty(String name, String email, String passwordPlain, String department) {
        this.name = name;
        this.email = email;
        this.passwordPlain = passwordPlain;
        this.department = department;
    }

    public Faculty(String name, String email, String passwordPlain, String department, String photoUrl) {
        this.name = name;
        this.email = email;
        this.passwordPlain = passwordPlain;
        this.department = department;
        this.photoUrl = photoUrl;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Integer getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Integer facultyId) {
        this.facultyId = facultyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordPlain() {
        return passwordPlain;
    }

    public void setPasswordPlain(String passwordPlain) {
        this.passwordPlain = passwordPlain;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
