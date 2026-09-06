package com.attendance.system.repository;

import com.attendance.system.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    List<Notice> findAllByOrderByPostedAtDesc();

    /**
     * Find notices matching target audience: All, or matching specific year / section.
     */
    @Query("SELECT n FROM Notice n WHERE n.targetAudience = 'All' " +
           "OR LOWER(n.targetAudience) LIKE LOWER(CONCAT('%', :year, '%')) " +
           "OR LOWER(n.targetAudience) LIKE LOWER(CONCAT('%', :section, '%')) " +
           "OR n.targetAudience = 'Specific Year' " +
           "OR n.targetAudience = 'Specific Section' " +
           "ORDER BY n.postedAt DESC")
    List<Notice> findByAudience(@Param("year") String year, @Param("section") String section);
}
