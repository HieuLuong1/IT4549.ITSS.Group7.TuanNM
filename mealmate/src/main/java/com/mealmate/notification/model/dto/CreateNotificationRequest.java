package com.mealmate.notification.model.dto;

import lombok.Builder;
import lombok.Data;

/** Dùng nội bộ giữa các service — không expose ra API public. */
@Data
@Builder
public class CreateNotificationRequest {
    private Long userId;
    private String category;
    private String severity;
    private String title;
    private String body;
}
