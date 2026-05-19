package com.devboard.service;

import com.devboard.dto.*;
import com.devboard.entity.*;
import com.devboard.enums.ProjectStatus;
import com.devboard.enums.Role;
import com.devboard.exception.BadRequestException;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TeamMembershipRepository teamMembershipRepository;

    public List<ProjectResponse> getProjects(Long userId) {
        return projectRepository.findProjectsByUserId(userId).stream()
                .map(p -> ProjectResponse.fromEntity(p, taskRepository.countByProjectId(p.getId())))
                .collect(Collectors.toList());
    }

    public ProjectResponse getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        return ProjectResponse.fromEntity(project, taskRepository.countByProjectId(id));
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();

        project = projectRepository.save(project);

        // Add owner as a member
        TeamMembership membership = TeamMembership.builder()
                .user(owner)
                .project(project)
                .role(owner.getRole() == Role.ADMIN ? Role.ADMIN : Role.PROJECT_MANAGER)
                .build();
        teamMembershipRepository.save(membership);

        return ProjectResponse.fromEntity(project, 0);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project = projectRepository.save(project);

        return ProjectResponse.fromEntity(project, taskRepository.countByProjectId(id));
    }

    @Transactional
    public ProjectResponse archiveProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        project.setArchived(true);
        project.setStatus(ProjectStatus.ARCHIVED);
        project = projectRepository.save(project);

        return ProjectResponse.fromEntity(project, taskRepository.countByProjectId(id));
    }
}
