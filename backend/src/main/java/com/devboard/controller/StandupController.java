package com.devboard.controller;

import com.devboard.dto.StandupRequest;
import com.devboard.dto.StandupResponse;
import com.devboard.entity.User;
import com.devboard.repository.UserRepository;
import com.devboard.service.StandupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Standups")
public class StandupController {

    private final StandupService standupService;
    private final UserRepository userRepository;

    @PostMapping("/standups")
    @Operation(summary = "Submit daily standup")
    public ResponseEntity<StandupResponse> submitStandup(@Valid @RequestBody StandupRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standupService.submitStandup(request, user.getId()));
    }

    @GetMapping("/projects/{projectId}/standups")
    @Operation(summary = "Get standups for a project")
    public ResponseEntity<List<StandupResponse>> getStandups(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(standupService.getStandups(projectId, date, userId));
    }

    @GetMapping("/standups/today")
    @Operation(summary = "Get today's standup for current user")
    public ResponseEntity<StandupResponse> getTodayStandup(
            @RequestParam Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        StandupResponse standup = standupService.getTodayStandup(user.getId(), projectId);
        return ResponseEntity.ok(standup);
    }
}
