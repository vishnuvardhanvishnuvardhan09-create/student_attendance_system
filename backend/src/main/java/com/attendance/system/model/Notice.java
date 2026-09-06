package com.attendance.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Notice entity representing announcements posted by faculty.
 */
@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Integer noticeId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "posted_by_faculty_id")
    private Faculty postedByFaculty;

    @Column(name = "posted_at", updatable = false)
    private LocalDateTime postedAt;

    @Column(name = "target_audience", nullable = false, length = 50)
    private String targetAudience; // All, Specific Year, Specific Section

    public Notice() {
    }

    public Notice(String title, String message, Faculty postedByFaculty, String targetAudience) {
        this.title = title;
        this.message = message;
        this.postedByFaculty = postedByFaculty;
        this.targetAudience = targetAudience;
    }

    @PrePersist
    protected void onCreate() {
        if (this.postedAt == null) {
            this.postedAt = LocalDateTime.now();
        }
        if (this.targetAudience == null) {
            this.targetAudience = "All";
        }
    }

    public Integer getNoticeId() {
        return noticeId;
    }

    public void setNoticeId(Integer noticeId) {
        this.noticeId = noticeId;
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

    public Faculty getPostedByFaculty() {
        return postedByFaculty;
    }

    public void setPostedByFaculty(Faculty postedByFaculty) {
        this.postedByFaculty = postedByFaculty;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
