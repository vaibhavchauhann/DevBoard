package com.devboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must be under 100 characters")
    private String name;

    private String description;
}
