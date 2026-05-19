package com.devboard.service;

import com.devboard.dto.TeamMemberRequest;
import com.devboard.dto.TeamMemberResponse;
import com.devboard.entity.Project;
import com.devboard.entity.TeamMembership;
import com.devboard.entity.User;
import com.devboard.enums.NotificationType;
import com.devboard.enums.Role;
import com.devboard.exception.BadRequestException;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.ProjectRepository;
import com.devboard.repository.TeamMembershipRepository;
import com.devboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamMembershipRepository teamMembershipRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<TeamMemberResponse> getMembers(Long projectId) {
        return teamMembershipRepository.findByProjectId(projectId).stream()
                .map(TeamMemberResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamMemberResponse addMember(Long projectId, TeamMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found with email: " + request.getEmail()));

        if (teamMembershipRepository.existsByUserIdAndProjectId(user.getId(), projectId)) {
            throw new BadRequestException("User is already a member of this project");
        }

        TeamMembership membership = TeamMembership.builder()
                .user(user)
                .project(project)
                .role(request.getRole() != null ? request.getRole() : Role.DEVELOPER)
                .build();

        membership = teamMembershipRepository.save(membership);

        notificationService.createAndSend(user.getId(), NotificationType.MEMBER_ADDED,
                "You have been added to project: " + project.getName(), projectId);

        return TeamMemberResponse.fromEntity(membership);
    }

    @Transactional
    public TeamMemberResponse updateMemberRole(Long projectId, Long userId, Role role) {
        TeamMembership membership = teamMembershipRepository.findByUserIdAndProjectId(userId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMembership not found", userId));

        membership.setRole(role);
        membership = teamMembershipRepository.save(membership);
        return TeamMemberResponse.fromEntity(membership);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        if (!teamMembershipRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new ResourceNotFoundException("TeamMembership not found", userId);
        }
        teamMembershipRepository.deleteByUserIdAndProjectId(userId, projectId);

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            notificationService.createAndSend(userId, NotificationType.MEMBER_REMOVED,
                    "You have been removed from project: " + project.getName(), projectId);
        }
    }
}
