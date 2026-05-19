package com.devboard.service;

import com.devboard.dto.TaskRequest;
import com.devboard.dto.TaskResponse;
import com.devboard.dto.TaskStatusUpdate;
import com.devboard.entity.*;
import com.devboard.enums.TaskStatus;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public List<TaskResponse> getTasksBySprint(Long sprintId) {
        return taskRepository.findBySprintIdOrderByPositionAsc(sprintId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return toResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, Long reporterId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : com.devboard.enums.TaskPriority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.BACKLOG)
                .project(project)
                .reporter(reporter)
                .labels(request.getLabels())
                .dueDate(request.getDueDate())
                .build();

        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", request.getSprintId()));
            task.setSprint(sprint);
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        task.setLabels(request.getLabels());
        task.setDueDate(request.getDueDate());

        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", request.getSprintId()));
            task.setSprint(sprint);
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, TaskStatusUpdate statusUpdate) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        task.setStatus(statusUpdate.getStatus());
        if (statusUpdate.getPosition() != null) {
            task.setPosition(statusUpdate.getPosition());
        }

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task", id);
        }
        taskRepository.deleteById(id);
    }

    private TaskResponse toResponse(Task task) {
        long commentCount = commentRepository.countByTaskId(task.getId());
        return TaskResponse.fromEntity(task, commentCount);
    }
}
