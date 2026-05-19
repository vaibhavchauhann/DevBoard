package com.devboard.service;

import com.devboard.dto.ActivityItem;
import com.devboard.dto.DashboardStats;
import com.devboard.entity.Project;
import com.devboard.enums.SprintStatus;
import com.devboard.enums.TaskStatus;
import com.devboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final StandupRepository standupRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final NotificationRepository notificationRepository;

    public DashboardStats getStats(Long userId) {
        List<Project> projects = projectRepository.findProjectsByUserId(userId);
        long totalProjects = projects.size();
        long activeSprints = 0;
        long totalTasks = 0;
        long completedTasks = 0;
        long teamSize = 0;

        for (Project p : projects) {
            activeSprints += sprintRepository.countByProjectIdAndStatus(p.getId(), SprintStatus.ACTIVE);
            totalTasks += taskRepository.countByProjectId(p.getId());
            completedTasks += taskRepository.countByProjectIdAndStatus(p.getId(), TaskStatus.DONE);
            teamSize += teamMembershipRepository.countByProjectId(p.getId());
        }

        long todayStandups = 0;
        for (Project p : projects) {
            todayStandups += standupRepository.countByProjectIdAndStandupDate(p.getId(), LocalDate.now());
        }

        return DashboardStats.builder()
                .totalProjects(totalProjects)
                .activeSprintCount(activeSprints)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(totalTasks - completedTasks)
                .teamSize(teamSize)
                .todayStandups(todayStandups)
                .build();
    }

    public List<ActivityItem> getActivity(Long userId) {
        List<ActivityItem> activities = new ArrayList<>();

        // Get recent notifications as activity
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .forEach(n -> activities.add(ActivityItem.builder()
                        .type(n.getType().name())
                        .message(n.getMessage())
                        .timestamp(n.getCreatedAt())
                        .build()));

        return activities;
    }
}
