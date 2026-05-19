package com.devboard.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class ApiError {
    private int status;
    private String message;
    private Map<String, String> errors;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
