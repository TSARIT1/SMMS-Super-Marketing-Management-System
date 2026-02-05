package in.main.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_reads", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"notification_id", "user_id"}))
public class NotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "read_at", nullable = false)
    private LocalDateTime readAt = LocalDateTime.now();

    // Constructors
    public NotificationRead() {
    }

    public NotificationRead(Long notificationId, Long userId) {
        this.notificationId = notificationId;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}
