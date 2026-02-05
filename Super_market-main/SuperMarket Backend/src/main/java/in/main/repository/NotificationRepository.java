package in.main.repository;

import in.main.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find active notifications for all users or specific user
    @Query("SELECT n FROM Notification n WHERE n.isActive = true " +
           "AND (n.targetUserId IS NULL OR n.targetUserId = :userId) " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findActiveNotificationsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    // Find all notifications (admin)
    List<Notification> findAllByOrderByCreatedAtDesc();
    
    // Find by created by admin
    List<Notification> findByCreatedByOrderByCreatedAtDesc(Long adminId);
    
    // Count active notifications
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isActive = true " +
           "AND (n.targetUserId IS NULL OR n.targetUserId = :userId) " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now)")
    Long countActiveNotificationsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
