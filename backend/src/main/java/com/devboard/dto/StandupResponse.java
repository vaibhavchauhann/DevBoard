package com.devboard.dto;

import com.devboard.entity.Standup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StandupResponse {
    private Long id;
    private UserDTO user;
    private Long projectId;
    private String projectName;
    private String yesterday;
    private String today;
    private String blockers;
    private LocalDate standupDate;
    private LocalDateTime createdAt;

    public static StandupResponse fromEntity(Standup standup) {
        return StandupResponse.builder()
                .id(standup.getId())
                .user(UserDTO.fromEntity(standup.getUser()))
                .projectId(standup.getProject().getId())
                .projectName(standup.getProject().getName())
                .yesterday(standup.getYesterday())
                .today(standup.getToday())
                .blockers(standup.getBlockers())
                .standupDate(standup.getStandupDate())
                .createdAt(standup.getCreatedAt())
                .build();
    }
}
