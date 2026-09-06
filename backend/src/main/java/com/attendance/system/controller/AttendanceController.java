package com.attendance.system.controller;

import com.attendance.system.dto.FacultyMarkAttendanceRequest;
import com.attendance.system.dto.MarkAttendanceRequest;
import com.attendance.system.model.Attendance;
import com.attendance.system.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * POST /api/attendance/mark
     * Student self-marking attendance with GPS Haversine verification.
     */
    @PostMapping("/mark")
    public ResponseEntity<?> markSelfAttendance(@Valid @RequestBody MarkAttendanceRequest request) {
        try {
            Attendance saved = attendanceService.markSelfAttendance(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    /**
     * GET /api/attendance/student/{studentId}
     * Full attendance history for a student.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable("studentId") Integer studentId) {
        List<Attendance> history = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/attendance/student/{studentId}/month/{year}/{month}
     * Monthly attendance breakdown for a student.
     */
    @GetMapping("/student/{studentId}/month/{year}/{month}")
    public ResponseEntity<List<Attendance>> getMonthlyAttendance(
            @PathVariable("studentId") Integer studentId,
            @PathVariable("year") int year,
            @PathVariable("month") int month) {
        List<Attendance> monthlyList = attendanceService.getAttendanceByStudentAndMonth(studentId, year, month);
        return ResponseEntity.ok(monthlyList);
    }

    /**
     * GET /api/attendance/all
     * All attendance records for admin/faculty dashboard.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        List<Attendance> all = attendanceService.getAllAttendance();
        return ResponseEntity.ok(all);
    }

    /**
     * POST /api/attendance/mark-by-faculty
     * Faculty/Admin manual attendance entry without GPS check.
     */
    @PostMapping("/mark-by-faculty")
    public ResponseEntity<?> markByFaculty(@Valid @RequestBody FacultyMarkAttendanceRequest request) {
        try {
            Attendance saved = attendanceService.markAttendanceByFaculty(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
