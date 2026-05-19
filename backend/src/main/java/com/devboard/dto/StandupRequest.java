package com.devboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StandupRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Yesterday's work is required")
    private String yesterday;

    @NotBlank(message = "Today's plan is required")
    private String today;

    private String blockers;
}
