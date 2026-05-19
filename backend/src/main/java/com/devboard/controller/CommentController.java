package com.devboard.controller;

import com.devboard.dto.CommentRequest;
import com.devboard.dto.CommentResponse;
import com.devboard.entity.User;
import com.devboard.repository.UserRepository;
import com.devboard.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all comments for a task")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getComments(taskId));
    }

    @PostMapping
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long taskId,
                                                       @Valid @RequestBody CommentRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(taskId, request, user.getId()));
    }
}
