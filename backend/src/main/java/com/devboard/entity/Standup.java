package com.devboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "standups", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "project_id", "standup_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Standup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String yesterday;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String today;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(name = "standup_date", nullable = false)
    @Builder.Default
    private LocalDate standupDate = LocalDate.now();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
