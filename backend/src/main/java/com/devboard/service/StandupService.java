package com.devboard.service;

import com.devboard.dto.StandupRequest;
import com.devboard.dto.StandupResponse;
import com.devboard.entity.Project;
import com.devboard.entity.Standup;
import com.devboard.entity.User;
import com.devboard.exception.BadRequestException;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.ProjectRepository;
import com.devboard.repository.StandupRepository;
import com.devboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandupService {

    private final StandupRepository standupRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public StandupResponse submitStandup(StandupRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));

        // Check if standup already submitted today for this project
        standupRepository.findByUserIdAndProjectIdAndStandupDate(userId, request.getProjectId(), LocalDate.now())
                .ifPresent(s -> { throw new BadRequestException("Standup already submitted for today"); });

        Standup standup = Standup.builder()
                .user(user)
                .project(project)
                .yesterday(request.getYesterday())
                .today(request.getToday())
                .blockers(request.getBlockers())
                .build();

        standup = standupRepository.save(standup);
        return StandupResponse.fromEntity(standup);
    }

    public List<StandupResponse> getStandups(Long projectId, LocalDate date, Long userId) {
        List<Standup> standups;
        if (date != null) {
            standups = standupRepository.findByProjectIdAndStandupDate(projectId, date);
        } else if (userId != null) {
            standups = standupRepository.findByUserIdAndProjectId(userId, projectId);
        } else {
            standups = standupRepository.findByProjectIdOrderByStandupDateDesc(projectId);
        }
        return standups.stream()
                .map(StandupResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public StandupResponse getTodayStandup(Long userId, Long projectId) {
        return standupRepository.findByUserIdAndProjectIdAndStandupDate(userId, projectId, LocalDate.now())
                .map(StandupResponse::fromEntity)
                .orElse(null);
    }
}
