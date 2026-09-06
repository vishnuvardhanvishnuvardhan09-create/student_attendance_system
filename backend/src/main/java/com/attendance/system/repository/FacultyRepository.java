package com.attendance.system.repository;

import com.attendance.system.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Integer> {
    Optional<Faculty> findByEmail(String email);
    Optional<Faculty> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
}
