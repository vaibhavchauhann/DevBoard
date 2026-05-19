package com.devboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalProjects;
    private long activeSprintCount;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long teamSize;
    private long todayStandups;
}
