package com.mealmate.notification.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tự động tạo bảng notifications nếu chưa tồn tại.
 * Chạy sau khi Spring context khởi động xong (ddl-auto: none nên Hibernate không tự tạo).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationSchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void createTableIfNotExists() {
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        id          BIGSERIAL PRIMARY KEY,
                        user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        category    VARCHAR(30)  NOT NULL,
                        severity    VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',
                        title       VARCHAR(255) NOT NULL,
                        body        TEXT,
                        is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
                        created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
                        updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
                    )
                    """);

            jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)");
            jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON notifications(user_id, is_read)");

            log.info("✅ Bảng notifications đã sẵn sàng.");
        } catch (Exception ex) {
            log.error("❌ Không thể tạo bảng notifications: {}", ex.getMessage());
        }
    }
}
