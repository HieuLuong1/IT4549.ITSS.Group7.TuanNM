package com.mealmate.notification.controller;

import com.mealmate.common.dto.ApiResponse;
import com.mealmate.notification.model.dto.NotificationResponse;
import com.mealmate.notification.service.NotificationService;
import com.mealmate.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    /** Lấy danh sách thông báo của người dùng hiện tại (tối đa 60 bản ghi, mới nhất trước). */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        Long userId = currentUserId();
        if (userId == null) return unauthorized();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", notificationService.getForUser(userId)));
    }

    /** Kiểm tra nhanh có thông báo chưa đọc không (dùng cho polling nhẹ). */
    @GetMapping("/has-unread")
    public ResponseEntity<ApiResponse<Boolean>> hasUnread() {
        Long userId = currentUserId();
        if (userId == null) return unauthorized();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", notificationService.hasUnread(userId)));
    }

    /** Đánh dấu tất cả đã đọc. */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        Long userId = currentUserId();
        if (userId == null) return unauthorized();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã đánh dấu tất cả đã đọc", null));
    }

    /** Đánh dấu một thông báo đã đọc. */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markOneRead(@PathVariable Long id) {
        Long userId = currentUserId();
        if (userId == null) return unauthorized();
        notificationService.markOneRead(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã đọc", null));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) return user.getId();
        return null;
    }

    private <T> ResponseEntity<ApiResponse<T>> unauthorized() {
        return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa xác thực", null));
    }
}
