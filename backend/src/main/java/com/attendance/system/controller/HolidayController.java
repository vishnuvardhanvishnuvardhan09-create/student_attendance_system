package com.attendance.system.controller;

import com.attendance.system.dto.HolidayRequest;
import com.attendance.system.model.Admin;
import com.attendance.system.model.Holiday;
import com.attendance.system.repository.AdminRepository;
import com.attendance.system.repository.HolidayRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@CrossOrigin(origins = {"http://localhost:3000", "https://student-attendance-system-frontend.vercel.app"})
public class HolidayController {

    private final HolidayRepository holidayRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public HolidayController(HolidayRepository holidayRepository, AdminRepository adminRepository) {
        this.holidayRepository = holidayRepository;
        this.adminRepository = adminRepository;
    }

    /**
     * GET /api/holidays
     * Fetch all holidays ordered chronologically.
     */
    @GetMapping
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(holidayRepository.findAllByOrderByDateAsc());
    }

    /**
     * POST /api/holidays
     * Note: admin-only by convention, enforced in UI (no server-side auth middleware).
     */
    @PostMapping
    public ResponseEntity<?> createHoliday(@Valid @RequestBody HolidayRequest request) {
        Admin admin = null;
        if (request.getAddedByAdminId() != null) {
            admin = adminRepository.findById(request.getAddedByAdminId()).orElse(null);
        }

        Holiday holiday = new Holiday(
                request.getDate(),
                request.getTitle(),
                request.getDescription(),
                admin
        );

        Holiday saved = holidayRepository.save(holiday);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * DELETE /api/holidays/{id}
     * Remove a holiday by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHoliday(@PathVariable("id") Integer id) {
        if (!holidayRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        holidayRepository.deleteById(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Holiday deleted successfully"));
    }
}
