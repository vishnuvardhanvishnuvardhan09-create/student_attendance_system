package com.attendance.system.controller;

import com.attendance.system.dto.DashboardSummaryResponse;
import com.attendance.system.model.Faculty;
import com.attendance.system.model.Student;
import com.attendance.system.repository.AttendanceRepository;
import com.attendance.system.repository.FacultyRepository;
import com.attendance.system.repository.FeedbackRepository;
import com.attendance.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class AdminController {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeedbackRepository feedbackRepository;

    @Autowired
    public AdminController(StudentRepository studentRepository,
                           FacultyRepository facultyRepository,
                           AttendanceRepository attendanceRepository,
                           FeedbackRepository feedbackRepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.attendanceRepository = attendanceRepository;
        this.feedbackRepository = feedbackRepository;
    }

    // ==========================================================
    // Student Management (CRUD)
    // ==========================================================

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable("id") Integer id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Email already registered"));
        }
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Roll number already registered"));
        }
        Student saved = studentRepository.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable("id") Integer id, @RequestBody Student updated) {
        return studentRepository.findById(id).map(student -> {
            if (updated.getName() != null) student.setName(updated.getName());
            if (updated.getEmail() != null) student.setEmail(updated.getEmail());
            if (updated.getPasswordPlain() != null) student.setPasswordPlain(updated.getPasswordPlain());
            if (updated.getRollNumber() != null) student.setRollNumber(updated.getRollNumber());
            if (updated.getDepartment() != null) student.setDepartment(updated.getDepartment());
            if (updated.getYear() != null) student.setYear(updated.getYear());
            if (updated.getSection() != null) student.setSection(updated.getSection());
            if (updated.getPhone() != null) student.setPhone(updated.getPhone());
            if (updated.getPhotoUrl() != null) student.setPhotoUrl(updated.getPhotoUrl());
            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/students/{id}/photo")
    public ResponseEntity<?> updateStudentPhoto(@PathVariable("id") Integer id, @RequestBody Map<String, String> payload) {
        String photoUrl = payload.get("photoUrl");
        if (photoUrl == null) {
            photoUrl = payload.get("photo_url");
        }
        final String finalPhotoUrl = photoUrl;
        return studentRepository.findById(id).map(student -> {
            student.setPhotoUrl(finalPhotoUrl);
            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") Integer id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Student deleted successfully"));
    }

    // ==========================================================
    // Faculty Management (CRUD)
    // ==========================================================

    @GetMapping("/faculty")
    public ResponseEntity<List<Faculty>> getAllFaculty() {
        return ResponseEntity.ok(facultyRepository.findAll());
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<?> getFacultyById(@PathVariable("id") Integer id) {
        return facultyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/faculty")
    public ResponseEntity<?> createFaculty(@RequestBody Faculty faculty) {
        if (facultyRepository.existsByEmail(faculty.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Email already registered"));
        }
        Faculty saved = facultyRepository.save(faculty);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<?> updateFaculty(@PathVariable("id") Integer id, @RequestBody Faculty updated) {
        return facultyRepository.findById(id).map(faculty -> {
            if (updated.getName() != null) faculty.setName(updated.getName());
            if (updated.getEmail() != null) faculty.setEmail(updated.getEmail());
            if (updated.getPasswordPlain() != null) faculty.setPasswordPlain(updated.getPasswordPlain());
            if (updated.getDepartment() != null) faculty.setDepartment(updated.getDepartment());
            if (updated.getPhotoUrl() != null) faculty.setPhotoUrl(updated.getPhotoUrl());
            return ResponseEntity.ok(facultyRepository.save(faculty));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/faculty/{id}/photo")
    public ResponseEntity<?> updateFacultyPhoto(@PathVariable("id") Integer id, @RequestBody Map<String, String> payload) {
        String photoUrl = payload.get("photoUrl");
        if (photoUrl == null) {
            photoUrl = payload.get("photo_url");
        }
        final String finalPhotoUrl = photoUrl;
        return facultyRepository.findById(id).map(faculty -> {
            faculty.setPhotoUrl(finalPhotoUrl);
            return ResponseEntity.ok(facultyRepository.save(faculty));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable("id") Integer id) {
        if (!facultyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        facultyRepository.deleteById(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Faculty deleted successfully"));
    }

    // ==========================================================
    // Dashboard Summary
    // ==========================================================

    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long pendingFeedback = feedbackRepository.countByStatus("New");

        LocalDate today = LocalDate.now();
        List<String> presentStatuses = Arrays.asList("Present", "Late", "Present-OutOfRange");
        long presentTodayCount = attendanceRepository.countByDateAndStatusIn(today, presentStatuses);

        double percentage = 0.0;
        if (totalStudents > 0) {
            percentage = ((double) presentTodayCount / totalStudents) * 100.0;
            percentage = Math.round(percentage * 100.0) / 100.0; // Round to 2 decimals
        }

        DashboardSummaryResponse summary = new DashboardSummaryResponse(
                totalStudents,
                totalFaculty,
                percentage,
                presentTodayCount,
                pendingFeedback
        );
        return ResponseEntity.ok(summary);
    }
}
