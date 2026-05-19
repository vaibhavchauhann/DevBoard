package com.devboard.repository;

import com.devboard.entity.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByProjectId(Long projectId);
    Optional<TeamMembership> findByUserIdAndProjectId(Long userId, Long projectId);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
    long countByProjectId(Long projectId);
    void deleteByUserIdAndProjectId(Long userId, Long projectId);
}
