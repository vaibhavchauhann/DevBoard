package com.devboard.service;

import com.devboard.dto.CommentRequest;
import com.devboard.dto.CommentResponse;
import com.devboard.entity.Comment;
import com.devboard.entity.Task;
import com.devboard.entity.User;
import com.devboard.exception.ResourceNotFoundException;
import com.devboard.repository.CommentRepository;
import com.devboard.repository.TaskRepository;
import com.devboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<CommentResponse> getComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(Long taskId, CommentRequest request, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .user(user)
                .build();

        comment = commentRepository.save(comment);
        return CommentResponse.fromEntity(comment);
    }
}
