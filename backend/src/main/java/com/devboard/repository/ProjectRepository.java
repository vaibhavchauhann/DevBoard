package com.devboard.repository;

import com.devboard.entity.Project;
import com.devboard.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    List<Project> findByOwnerIdAndStatus(Long ownerId, ProjectStatus status);

    @Query("SELECT COUNT(p) FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
