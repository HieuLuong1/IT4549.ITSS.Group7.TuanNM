package com.mealmate.notification.repository;

import com.mealmate.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Lấy tất cả thông báo của user, mới nhất trước, giới hạn 60 bản ghi. */
    List<Notification> findTop60ByUserIdOrderByCreatedAtDesc(Long userId);

    /** Kiểm tra còn thông báo chưa đọc không. */
    boolean existsByUserIdAndReadFalse(Long userId);

    /** Đánh dấu tất cả đã đọc cho user. */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    int markAllReadByUserId(@Param("userId") Long userId);
}
