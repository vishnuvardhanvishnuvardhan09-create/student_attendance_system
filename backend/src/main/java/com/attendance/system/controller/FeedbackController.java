package com.attendance.system.controller;

import com.attendance.system.dto.FeedbackRequest;
import com.attendance.system.model.Feedback;
import com.attendance.system.model.Student;
import com.attendance.system.repository.FeedbackRepository;
import com.attendance.system.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public FeedbackController(FeedbackRepository feedbackRepository, StudentRepository studentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * POST /api/feedback
     * Student submits feedback or grievance.
     */
    @PostMapping
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Student not found with ID: " + request.getStudentId()));
        }

        Feedback feedback = new Feedback(
                student,
                request.getSubject(),
                request.getMessage(),
                "New"
        );

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/feedback
     * Faculty/Admin views all feedback ordered newest first.
     */
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderBySubmittedAtDesc());
    }

    /**
     * PUT /api/feedback/{id}/status
     * Update status (e.g. mark as Reviewed). Defaults to "Reviewed" if no status specified.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateFeedbackStatus(
            @PathVariable("id") Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        return feedbackRepository.findById(id).map(feedback -> {
            String newStatus = "Reviewed";
            if (body != null && body.containsKey("status") && body.get("status") != null && !body.get("status").isBlank()) {
                newStatus = body.get("status");
            }
            feedback.setStatus(newStatus);
            Feedback updated = feedbackRepository.save(feedback);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
