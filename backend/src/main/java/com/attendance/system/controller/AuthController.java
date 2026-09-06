package com.attendance.system.controller;

import com.attendance.system.dto.LoginRequest;
import com.attendance.system.dto.StudentRegisterRequest;
import com.attendance.system.model.Admin;
import com.attendance.system.model.Faculty;
import com.attendance.system.model.Student;
import com.attendance.system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Admin Login
     * Matches plain-text password. Returns Admin JSON or 401 Unauthorized.
     */
    @PostMapping("/login/admin")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody LoginRequest request) {
        Optional<Admin> admin = authService.authenticateAdmin(request.getEmail(), request.getPassword());
        if (admin.isPresent()) {
            return ResponseEntity.ok(admin.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid email or password"));
    }

    /**
     * Faculty Login
     * Matches plain-text password. Returns Faculty JSON or 401 Unauthorized.
     */
    @PostMapping("/login/faculty")
    public ResponseEntity<?> loginFaculty(@Valid @RequestBody LoginRequest request) {
        Optional<Faculty> faculty = authService.authenticateFaculty(request.getEmail(), request.getPassword());
        if (faculty.isPresent()) {
            return ResponseEntity.ok(faculty.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid email or password"));
    }

    /**
     * Student Login
     * Matches plain-text password. Returns Student JSON or 401 Unauthorized.
     */
    @PostMapping("/login/student")
    public ResponseEntity<?> loginStudent(@Valid @RequestBody LoginRequest request) {
        Optional<Student> student = authService.authenticateStudent(request.getEmail(), request.getPassword());
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid email or password"));
    }

    /**
     * Student Registration
     * Creates new student record with plain-text password.
     */
    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        if (authService.isStudentEmailTaken(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Email is already registered"));
        }
        if (authService.isStudentRollNumberTaken(request.getRollNumber())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Roll number is already registered"));
        }

        Student newStudent = authService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newStudent);
    }
}
