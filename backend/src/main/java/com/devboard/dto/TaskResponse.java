package com.devboard.dto;

import com.devboard.entity.Task;
import com.devboard.enums.TaskPriority;
import com.devboard.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long projectId;
    private Long sprintId;
    private UserDTO assignee;
    private UserDTO reporter;
    private String labels;
    private LocalDate dueDate;
    private Integer position;
    private long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task, long commentCount) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .projectId(task.getProject().getId())
                .sprintId(task.getSprint() != null ? task.getSprint().getId() : null)
                .assignee(UserDTO.fromEntity(task.getAssignee()))
                .reporter(UserDTO.fromEntity(task.getReporter()))
                .labels(task.getLabels())
                .dueDate(task.getDueDate())
                .position(task.getPosition())
                .commentCount(commentCount)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
