package com.devboard.controller;

import com.devboard.dto.TaskRequest;
import com.devboard.dto.TaskResponse;
import com.devboard.dto.TaskStatusUpdate;
import com.devboard.entity.User;
import com.devboard.repository.UserRepository;
import com.devboard.service.NotificationService;
import com.devboard.service.TaskService;
import com.devboard.enums.NotificationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/sprints/{sprintId}/tasks")
    @Operation(summary = "Get all tasks for a sprint")
    public ResponseEntity<List<TaskResponse>> getTasksBySprint(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getTasksBySprint(sprintId));
    }

    @GetMapping("/projects/{projectId}/tasks")
    @Operation(summary = "Get all tasks for a project")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/tasks/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @PostMapping("/tasks")
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        TaskResponse task = taskService.createTask(request, user.getId());

        // Notify assignee
        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(user.getId())) {
            notificationService.createAndSend(request.getAssigneeId(), NotificationType.TASK_ASSIGNED,
                    "You have been assigned to task: " + task.getTitle(), task.getId());
        }

        // Broadcast board update
        if (task.getSprintId() != null) {
            messagingTemplate.convertAndSend("/topic/board/" + task.getSprintId(), task);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/tasks/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,
                                                    @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.updateTask(id, request);
        if (task.getSprintId() != null) {
            messagingTemplate.convertAndSend("/topic/board/" + task.getSprintId(), task);
        }
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/tasks/{id}/status")
    @Operation(summary = "Update task status (Kanban move)")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody TaskStatusUpdate statusUpdate) {
        TaskResponse task = taskService.updateTaskStatus(id, statusUpdate);
        if (task.getSprintId() != null) {
            messagingTemplate.convertAndSend("/topic/board/" + task.getSprintId(), task);
        }
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/tasks/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
