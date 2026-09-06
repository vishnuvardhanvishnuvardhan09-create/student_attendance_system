package com.attendance.system.repository;

import com.attendance.system.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findAllByOrderBySubmittedAtDesc();

    List<Feedback> findByStudentStudentIdOrderBySubmittedAtDesc(Integer studentId);

    long countByStatus(String status);
}
