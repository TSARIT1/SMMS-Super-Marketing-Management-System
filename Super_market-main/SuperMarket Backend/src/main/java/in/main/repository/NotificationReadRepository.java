package in.main.repository;

import in.main.entities.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {
    
    // Check if user has read a notification
    Optional<NotificationRead> findByNotificationIdAndUserId(Long notificationId, Long userId);
    
    // Get all read notifications for a user
    List<NotificationRead> findByUserId(Long userId);
    
    // Get all users who read a specific notification
    List<NotificationRead> findByNotificationId(Long notificationId);
    
    // Count unread notifications
    Long countByUserId(Long userId);
}
