package com.devboard.service;

import com.devboard.dto.SprintRequest;
import com.devboard.dto.SprintResponse;
import com.devboard.entity.Project;
import com.devboard.entity.Sprint;
import com.devboard.enums.SprintStatus;
import com.devboard.enums.TaskStatus;
import com.devboard.exception.BadRequestException;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.ProjectRepository;
import com.devboard.repository.SprintRepository;
import com.devboard.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public List<SprintResponse> getSprints(Long projectId) {
        return sprintRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SprintResponse getSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));
        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse createSprint(Long projectId, SprintRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .project(project)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        sprint = sprintRepository.save(sprint);
        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(Long id, SprintRequest request) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());

        sprint = sprintRepository.save(sprint);
        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse updateSprintStatus(Long id, SprintStatus status) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));

        sprint.setStatus(status);
        sprint = sprintRepository.save(sprint);
        return toResponse(sprint);
    }

    private SprintResponse toResponse(Sprint sprint) {
        long total = taskRepository.countBySprintId(sprint.getId());
        long completed = taskRepository.countBySprintIdAndStatus(sprint.getId(), TaskStatus.DONE);
        return SprintResponse.fromEntity(sprint, total, completed);
    }
}
