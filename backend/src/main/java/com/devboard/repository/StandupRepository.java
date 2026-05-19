package com.devboard.repository;

import com.devboard.entity.Standup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StandupRepository extends JpaRepository<Standup, Long> {
    List<Standup> findByProjectIdOrderByStandupDateDesc(Long projectId);
    List<Standup> findByProjectIdAndStandupDate(Long projectId, LocalDate date);
    List<Standup> findByUserIdAndProjectId(Long userId, Long projectId);
    Optional<Standup> findByUserIdAndProjectIdAndStandupDate(Long userId, Long projectId, LocalDate date);
    Optional<Standup> findByUserIdAndStandupDate(Long userId, LocalDate date);
    long countByProjectIdAndStandupDate(Long projectId, LocalDate date);
}
