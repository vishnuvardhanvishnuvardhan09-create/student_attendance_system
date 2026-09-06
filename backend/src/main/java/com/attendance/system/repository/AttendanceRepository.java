package com.attendance.system.repository;

import com.attendance.system.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    /**
     * Retrieve full attendance history for a given student ordered by date descending.
     */
    List<Attendance> findByStudentStudentIdOrderByDateDesc(Integer studentId);

    /**
     * Find attendance record for a specific student on a specific date.
     */
    Optional<Attendance> findByStudentStudentIdAndDate(Integer studentId, LocalDate date);

    /**
     * Retrieve attendance records for a student in a specific year and month.
     */
    @Query("SELECT a FROM Attendance a WHERE a.student.studentId = :studentId " +
           "AND YEAR(a.date) = :year AND MONTH(a.date) = :month ORDER BY a.date ASC")
    List<Attendance> findByStudentIdAndYearAndMonth(
            @Param("studentId") Integer studentId,
            @Param("year") int year,
            @Param("month") int month
    );

    /**
     * Retrieve all attendance records ordered by date descending.
     */
    List<Attendance> findAllByOrderByDateDesc();

    /**
     * Count attendance records for a specific date matching specified statuses.
     */
    long countByDateAndStatusIn(LocalDate date, List<String> statuses);
}
