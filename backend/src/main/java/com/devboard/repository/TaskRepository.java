package com.devboard.repository;

import com.devboard.entity.Task;
import com.devboard.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findBySprintIdOrderByPositionAsc(Long sprintId);
    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Task> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    long countBySprintId(Long sprintId);
    long countBySprintIdAndStatus(Long sprintId, TaskStatus status);
    long countByAssigneeId(Long assigneeId);

    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.project.id = :projectId GROUP BY t.status")
    List<Object[]> countByProjectGroupedByStatus(@Param("projectId") Long projectId);

    @Query("SELECT t.assignee.id, COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.assignee IS NOT NULL GROUP BY t.assignee.id")
    List<Object[]> countByProjectGroupedByAssignee(@Param("projectId") Long projectId);
}
