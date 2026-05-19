package com.devboard.dto;

import com.devboard.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusUpdate {
    @NotNull(message = "Status is required")
    private TaskStatus status;

    private Integer position;
}
