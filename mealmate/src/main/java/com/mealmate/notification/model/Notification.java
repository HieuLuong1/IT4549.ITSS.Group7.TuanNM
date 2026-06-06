package com.mealmate.notification.model;

import com.mealmate.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** FRIDGE | SHOPPING | MEAL | GROUP | SYSTEM */
    @Column(name = "category", nullable = false, length = 30)
    private String category;

    /** INFO | NORMAL | MEDIUM | HIGH */
    @Column(name = "severity", nullable = false, length = 20)
    @Builder.Default
    private String severity = NotificationSeverity.NORMAL;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;
}
