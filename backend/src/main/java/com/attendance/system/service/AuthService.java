package com.attendance.system.service;

import com.attendance.system.dto.StudentRegisterRequest;
import com.attendance.system.model.Admin;
import com.attendance.system.model.Faculty;
import com.attendance.system.model.Student;
import com.attendance.system.repository.AdminRepository;
import com.attendance.system.repository.FacultyRepository;
import com.attendance.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public AuthService(AdminRepository adminRepository,
                       FacultyRepository facultyRepository,
                       StudentRepository studentRepository) {
        this.adminRepository = adminRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Authenticate admin by plain text password.
     */
    public Optional<Admin> authenticateAdmin(String email, String password) {
        if (email == null || password == null) {
            return Optional.empty();
        }
        return adminRepository.findByEmailIgnoreCase(email.trim())
                .filter(admin -> admin.getPasswordPlain().equals(password.trim()));
    }

    /**
     * Authenticate faculty by plain text password.
     */
    public Optional<Faculty> authenticateFaculty(String email, String password) {
        if (email == null || password == null) {
            return Optional.empty();
        }
        return facultyRepository.findByEmailIgnoreCase(email.trim())
                .filter(faculty -> faculty.getPasswordPlain().equals(password.trim()));
    }

    /**
     * Authenticate student by plain text password (supports email or roll number).
     */
    public Optional<Student> authenticateStudent(String emailOrRoll, String password) {
        if (emailOrRoll == null || password == null) {
            return Optional.empty();
        }
        String clean = emailOrRoll.trim();
        Optional<Student> student = studentRepository.findByEmailIgnoreCase(clean);
        if (student.isEmpty()) {
            student = studentRepository.findByRollNumber(clean);
        }
        return student.filter(s -> s.getPasswordPlain().equals(password.trim()));
    }

    /**
     * Check if email is already taken by student.
     */
    public boolean isStudentEmailTaken(String email) {
        return studentRepository.existsByEmail(email);
    }

    /**
     * Check if roll number is already taken.
     */
    public boolean isStudentRollNumberTaken(String rollNumber) {
        return studentRepository.existsByRollNumber(rollNumber);
    }

    /**
     * Register a new student.
     */
    public Student registerStudent(StudentRegisterRequest req) {
        Student student = new Student();
        student.setName(req.getName());
        student.setEmail(req.getEmail());
        student.setPasswordPlain(req.getPassword());
        student.setRollNumber(req.getRollNumber());
        student.setDepartment(req.getDepartment());
        student.setYear(req.getYear());
        student.setSection(req.getSection());
        student.setPhone(req.getPhone());
        student.setPhotoUrl(req.getPhotoUrl());
        return studentRepository.save(student);
    }
}
