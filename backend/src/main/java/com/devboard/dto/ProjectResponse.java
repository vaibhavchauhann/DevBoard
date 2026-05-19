package com.devboard.dto;

import com.devboard.entity.Project;
import com.devboard.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private UserDTO owner;
    private int memberCount;
    private long taskCount;
    private int sprintCount;
    private Boolean archived;
    private LocalDateTime createdAt;

    public static ProjectResponse fromEntity(Project project, long taskCount) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .owner(UserDTO.fromEntity(project.getOwner()))
                .memberCount(project.getMembers() != null ? project.getMembers().size() : 0)
                .taskCount(taskCount)
                .sprintCount(project.getSprints() != null ? project.getSprints().size() : 0)
                .archived(project.getArchived())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
