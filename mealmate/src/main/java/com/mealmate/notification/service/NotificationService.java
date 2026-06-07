package com.mealmate.notification.service;

import com.mealmate.notification.model.Notification;
import com.mealmate.notification.model.NotificationSeverity;
import com.mealmate.notification.model.dto.CreateNotificationRequest;
import com.mealmate.notification.model.dto.NotificationResponse;
import com.mealmate.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    // ── Tạo thông báo (gọi từ các service khác) ──────────────────────────────

    /** REQUIRES_NEW: lưu notification độc lập, không bị rollback cùng transaction cha. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void push(CreateNotificationRequest req) {
        try {
            Notification n = Notification.builder()
                    .userId(req.getUserId())
                    .category(req.getCategory())
                    .severity(req.getSeverity() != null ? req.getSeverity() : NotificationSeverity.NORMAL)
                    .title(req.getTitle())
                    .body(req.getBody())
                    .build();
            repo.save(n);
        } catch (Exception ex) {
            // Không để lỗi notification làm sập luồng chính
            log.error("Không thể lưu notification cho userId={}: {}", req.getUserId(), ex.getMessage());
        }
    }

    /** Tiện ích nhanh cho các service gọi inline — cũng dùng REQUIRES_NEW. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void push(Long userId, String category, String severity, String title, String body) {
        push(CreateNotificationRequest.builder()
                .userId(userId)
                .category(category)
                .severity(severity)
                .title(title)
                .body(body)
                .build());
    }

    // ── Truy vấn ─────────────────────────────────────────────────────────────

    public List<NotificationResponse> getForUser(Long userId) {
        return repo.findTop60ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public boolean hasUnread(Long userId) {
        return repo.existsByUserIdAndReadFalse(userId);
    }

    // ── Đánh dấu đọc ─────────────────────────────────────────────────────────

    @Transactional
    public void markAllRead(Long userId) {
        repo.markAllReadByUserId(userId);
    }

    @Transactional
    public void markOneRead(Long notificationId, Long userId) {
        repo.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                repo.save(n);
            }
        });
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .category(n.getCategory())
                .severity(n.getSeverity())
                .title(n.getTitle())
                .body(n.getBody())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
