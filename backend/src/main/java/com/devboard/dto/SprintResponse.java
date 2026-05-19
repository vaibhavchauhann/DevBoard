package com.devboard.dto;

import com.devboard.entity.Sprint;
import com.devboard.enums.SprintStatus;
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
public class SprintResponse {
    private Long id;
    private String name;
    private String goal;
    private Long projectId;
    private String projectName;
    private SprintStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalTasks;
    private long completedTasks;
    private LocalDateTime createdAt;

    public static SprintResponse fromEntity(Sprint sprint, long totalTasks, long completedTasks) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .projectId(sprint.getProject().getId())
                .projectName(sprint.getProject().getName())
                .status(sprint.getStatus())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .createdAt(sprint.getCreatedAt())
                .build();
    }
}
