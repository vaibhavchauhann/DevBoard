package com.devboard.controller;

import com.devboard.dto.SprintRequest;
import com.devboard.dto.SprintResponse;
import com.devboard.enums.SprintStatus;
import com.devboard.service.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Sprints")
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/projects/{projectId}/sprints")
    @Operation(summary = "Get all sprints for a project")
    public ResponseEntity<List<SprintResponse>> getSprints(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprints(projectId));
    }

    @GetMapping("/sprints/{id}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<SprintResponse> getSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprint(id));
    }

    @PostMapping("/projects/{projectId}/sprints")
    @Operation(summary = "Create a new sprint")
    public ResponseEntity<SprintResponse> createSprint(@PathVariable Long projectId,
                                                        @Valid @RequestBody SprintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sprintService.createSprint(projectId, request));
    }

    @PutMapping("/sprints/{id}")
    @Operation(summary = "Update a sprint")
    public ResponseEntity<SprintResponse> updateSprint(@PathVariable Long id,
                                                        @Valid @RequestBody SprintRequest request) {
        return ResponseEntity.ok(sprintService.updateSprint(id, request));
    }

    @PatchMapping("/sprints/{id}/status")
    @Operation(summary = "Update sprint status")
    public ResponseEntity<SprintResponse> updateStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        SprintStatus status = SprintStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(sprintService.updateSprintStatus(id, status));
    }
}
