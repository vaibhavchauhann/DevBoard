package com.devboard.controller;

import com.devboard.dto.TeamMemberRequest;
import com.devboard.dto.TeamMemberResponse;
import com.devboard.enums.Role;
import com.devboard.service.TeamService;
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
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
@Tag(name = "Team")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Get all team members for a project")
    public ResponseEntity<List<TeamMemberResponse>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamService.getMembers(projectId));
    }

    @PostMapping
    @Operation(summary = "Add a member to the project")
    public ResponseEntity<TeamMemberResponse> addMember(@PathVariable Long projectId,
                                                         @Valid @RequestBody TeamMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.addMember(projectId, request));
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update member role")
    public ResponseEntity<TeamMemberResponse> updateRole(@PathVariable Long projectId,
                                                          @PathVariable Long userId,
                                                          @RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role"));
        return ResponseEntity.ok(teamService.updateMemberRole(projectId, userId, role));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Remove a member from the project")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        teamService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}
