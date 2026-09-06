package com.attendance.system.controller;

import com.attendance.system.dto.NoticeRequest;
import com.attendance.system.model.Faculty;
import com.attendance.system.model.Notice;
import com.attendance.system.repository.FacultyRepository;
import com.attendance.system.repository.NoticeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class NoticeController {

    private final NoticeRepository noticeRepository;
    private final FacultyRepository facultyRepository;

    @Autowired
    public NoticeController(NoticeRepository noticeRepository, FacultyRepository facultyRepository) {
        this.noticeRepository = noticeRepository;
        this.facultyRepository = facultyRepository;
    }

    /**
     * GET /api/notices
     * Retrieve all notices ordered newest first.
     */
    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByPostedAtDesc());
    }

    /**
     * GET /api/notices/audience/{year}/{section}
     * Retrieve notices relevant to a student's year and section (including general notices).
     */
    @GetMapping("/audience/{year}/{section}")
    public ResponseEntity<List<Notice>> getNoticesByAudience(
            @PathVariable("year") String year,
            @PathVariable("section") String section) {
        List<Notice> notices = noticeRepository.findByAudience(year, section);
        return ResponseEntity.ok(notices);
    }

    /**
     * POST /api/notices
     * Faculty posts a notice for all students or specific year/section.
     */
    @PostMapping
    public ResponseEntity<?> createNotice(@Valid @RequestBody NoticeRequest request) {
        Faculty faculty = null;
        if (request.getPostedByFacultyId() != null) {
            faculty = facultyRepository.findById(request.getPostedByFacultyId()).orElse(null);
        }

        String targetAudience = (request.getTargetAudience() != null && !request.getTargetAudience().isBlank())
                ? request.getTargetAudience()
                : "All";

        Notice notice = new Notice(
                request.getTitle(),
                request.getMessage(),
                faculty,
                targetAudience
        );

        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
