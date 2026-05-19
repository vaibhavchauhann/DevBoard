package com.devboard.repository;

import com.devboard.entity.Sprint;
import com.devboard.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);
    long countByProjectIdAndStatus(Long projectId, SprintStatus status);
}
