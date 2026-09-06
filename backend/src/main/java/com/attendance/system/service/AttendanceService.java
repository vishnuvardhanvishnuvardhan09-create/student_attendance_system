package com.attendance.system.service;

import com.attendance.system.dto.FacultyMarkAttendanceRequest;
import com.attendance.system.dto.MarkAttendanceRequest;
import com.attendance.system.model.Attendance;
import com.attendance.system.model.Student;
import com.attendance.system.repository.AttendanceRepository;
import com.attendance.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    @Value("${campus.latitude:12.971598}")
    private double campusLatitude;

    @Value("${campus.longitude:77.594566}")
    private double campusLongitude;

    @Value("${campus.radius-meters:200.0}")
    private double campusRadiusMeters;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Mark attendance by student (self) with Geofence Haversine distance verification.
     * Sets date=today, time_in=now, marked_by="self".
     * If outside radius, saves record with status="Present-OutOfRange".
     */
    public Attendance markSelfAttendance(MarkAttendanceRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + req.getStudentId()));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        String finalStatus;
        if (req.getLatitude() == null || req.getLongitude() == null) {
            finalStatus = "Present-OutOfRange";
        } else {
            double distance = calculateHaversineDistance(
                    campusLatitude, campusLongitude,
                    req.getLatitude().doubleValue(), req.getLongitude().doubleValue()
            );

            if (distance > campusRadiusMeters) {
                finalStatus = "Present-OutOfRange";
            } else {
                finalStatus = (req.getStatus() != null && !req.getStatus().isBlank())
                        ? req.getStatus()
                        : "Present";
            }
        }

        // Update if already marked today, or create a new entry
        Attendance attendance = attendanceRepository.findByStudentStudentIdAndDate(student.getStudentId(), today)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(today);
        attendance.setTimeIn(now);
        attendance.setStatus(finalStatus);
        attendance.setLatitude(req.getLatitude());
        attendance.setLongitude(req.getLongitude());
        attendance.setMarkedBy("self");

        return attendanceRepository.save(attendance);
    }

    /**
     * Mark attendance manually by faculty (no GPS check).
     */
    public Attendance markAttendanceByFaculty(FacultyMarkAttendanceRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + req.getStudentId()));

        LocalDate date = req.getDate() != null ? req.getDate() : LocalDate.now();
        LocalTime timeIn = req.getTimeIn();
        if (timeIn == null && !"Absent".equalsIgnoreCase(req.getStatus())) {
            timeIn = LocalTime.now();
        }

        String markedBy = (req.getMarkedBy() != null && !req.getMarkedBy().isBlank())
                ? req.getMarkedBy()
                : "faculty";

        Attendance attendance = attendanceRepository.findByStudentStudentIdAndDate(student.getStudentId(), date)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setTimeIn(timeIn);
        attendance.setStatus(req.getStatus());
        attendance.setLatitude(null);
        attendance.setLongitude(null);
        attendance.setMarkedBy(markedBy);

        return attendanceRepository.save(attendance);
    }

    /**
     * Full attendance history for a given student.
     */
    public List<Attendance> getAttendanceByStudent(Integer studentId) {
        return attendanceRepository.findByStudentStudentIdOrderByDateDesc(studentId);
    }

    /**
     * Attendance history for a student in a specific year and month.
     */
    public List<Attendance> getAttendanceByStudentAndMonth(Integer studentId, int year, int month) {
        return attendanceRepository.findByStudentIdAndYearAndMonth(studentId, year, month);
    }

    /**
     * All attendance records for admin/faculty view.
     */
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAllByOrderByDateDesc();
    }

    /**
     * Calculate distance between two coordinates in meters using the Haversine formula.
     */
    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS = 6371000.0; // Radius of the Earth in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS * c;
    }
}
