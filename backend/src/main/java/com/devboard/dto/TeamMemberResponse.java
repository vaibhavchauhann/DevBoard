package com.devboard.dto;

import com.devboard.entity.TeamMembership;
import com.devboard.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private Long id;
    private UserDTO user;
    private Role role;
    private LocalDateTime joinedAt;

    public static TeamMemberResponse fromEntity(TeamMembership tm) {
        return TeamMemberResponse.builder()
                .id(tm.getId())
                .user(UserDTO.fromEntity(tm.getUser()))
                .role(tm.getRole())
                .joinedAt(tm.getJoinedAt())
                .build();
    }
}
