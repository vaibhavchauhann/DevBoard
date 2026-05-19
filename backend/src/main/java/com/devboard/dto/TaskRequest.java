package com.devboard.dto;

import com.devboard.enums.TaskPriority;
import com.devboard.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    private TaskPriority priority;

    private TaskStatus status;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long sprintId;

    private Long assigneeId;

    private String labels;

    private LocalDate dueDate;
}
