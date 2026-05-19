package com.devboard.service;

import com.devboard.dto.NotificationResponse;
import com.devboard.entity.Notification;
import com.devboard.entity.User;
import com.devboard.enums.NotificationType;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.NotificationRepository;
import com.devboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void createAndSend(Long userId, NotificationType type, String message, Long referenceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();

        notification = notificationRepository.save(notification);
        NotificationResponse response = NotificationResponse.fromEntity(notification);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, response);
    }
}
