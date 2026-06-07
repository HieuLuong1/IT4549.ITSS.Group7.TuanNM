package com.mealmate.notification.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String category;
    private String severity;
    private String title;
    private String body;
    private boolean read;
    private LocalDateTime createdAt;
}
