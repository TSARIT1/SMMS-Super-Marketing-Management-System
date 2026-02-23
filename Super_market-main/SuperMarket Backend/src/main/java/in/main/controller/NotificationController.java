package in.main.controller;

import in.main.entities.Notification;
import in.main.entities.NotificationRead;
import in.main.repository.NotificationReadRepository;
import in.main.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082"}, allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadRepository notificationReadRepository;

    /**
     * Get all notifications for a user (with read status)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findActiveNotificationsForUser(userId, LocalDateTime.now());
            List<NotificationRead> readNotifications = notificationReadRepository.findByUserId(userId);
            
            Set<Long> readIds = readNotifications.stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());
            
            List<Map<String, Object>> result = notifications.stream().map(notification -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", notification.getId());
                map.put("title", notification.getTitle());
                map.put("message", notification.getMessage());
                map.put("link", notification.getLink());
                map.put("type", notification.getType().name());
                map.put("priority", notification.getPriority().name());
                map.put("createdAt", notification.getCreatedAt().toString());
                map.put("expiresAt", notification.getExpiresAt() != null ? notification.getExpiresAt().toString() : null);
                map.put("isRead", readIds.contains(notification.getId()));
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch notifications: " + e.getMessage()));
        }
    }

    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findActiveNotificationsForUser(userId, LocalDateTime.now());
            List<NotificationRead> readNotifications = notificationReadRepository.findByUserId(userId);
            
            Set<Long> readIds = readNotifications.stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());
            
            long unreadCount = notifications.stream()
                .filter(n -> !readIds.contains(n.getId()))
                .count();

            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count unread notifications: " + e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        try {
            // Check if already read
            Optional<NotificationRead> existing = notificationReadRepository.findByNotificationIdAndUserId(notificationId, userId);
            if (existing.isPresent()) {
                return ResponseEntity.ok(Map.of("message", "Already marked as read"));
            }

            // Mark as read
            NotificationRead notificationRead = new NotificationRead(notificationId, userId);
            notificationReadRepository.save(notificationRead);

            return ResponseEntity.ok(Map.of("message", "Marked as read successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark as read: " + e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findActiveNotificationsForUser(userId, LocalDateTime.now());
            List<NotificationRead> readNotifications = notificationReadRepository.findByUserId(userId);
            
            Set<Long> readIds = readNotifications.stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());

            // Mark unread notifications as read
            notifications.stream()
                .filter(n -> !readIds.contains(n.getId()))
                .forEach(n -> {
                    NotificationRead notificationRead = new NotificationRead(n.getId(), userId);
                    notificationReadRepository.save(notificationRead);
                });

            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark all as read: " + e.getMessage()));
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Create new notification (Admin)
     */
    @PostMapping("/admin/create")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> request) {
        try {
            Notification notification = new Notification();
            notification.setTitle(request.get("title").toString());
            notification.setMessage(request.get("message").toString());
            notification.setLink(request.getOrDefault("link", "").toString());
            notification.setType(Notification.NotificationType.valueOf(request.getOrDefault("type", "INFO").toString()));
            notification.setPriority(Notification.Priority.valueOf(request.getOrDefault("priority", "NORMAL").toString()));
            
            if (request.containsKey("targetUserId") && request.get("targetUserId") != null) {
                notification.setTargetUserId(Long.parseLong(request.get("targetUserId").toString()));
            }
            
            if (request.containsKey("expiresAt") && request.get("expiresAt") != null) {
                notification.setExpiresAt(LocalDateTime.parse(request.get("expiresAt").toString()));
            }
            
            if (request.containsKey("createdBy")) {
                notification.setCreatedBy(Long.parseLong(request.get("createdBy").toString()));
            }

            Notification saved = notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of(
                    "message", "Notification created successfully",
                    "notificationId", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create notification: " + e.getMessage()));
        }
    }

    /**
     * Get all notifications (Admin)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
            
            List<Map<String, Object>> result = notifications.stream().map(notification -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", notification.getId());
                map.put("title", notification.getTitle());
                map.put("message", notification.getMessage());
                map.put("link", notification.getLink());
                map.put("type", notification.getType().name());
                map.put("priority", notification.getPriority().name());
                map.put("targetUserId", notification.getTargetUserId());
                map.put("isActive", notification.getIsActive());
                map.put("createdBy", notification.getCreatedBy());
                map.put("createdAt", notification.getCreatedAt().toString());
                map.put("expiresAt", notification.getExpiresAt() != null ? notification.getExpiresAt().toString() : null);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch notifications: " + e.getMessage()));
        }
    }

    /**
     * Update notification (Admin)
     */
    @PutMapping("/admin/{notificationId}")
    public ResponseEntity<?> updateNotification(
            @PathVariable Long notificationId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
            if (notificationOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Notification not found"));
            }

            Notification notification = notificationOptional.get();
            
            if (request.containsKey("title")) {
                notification.setTitle(request.get("title").toString());
            }
            if (request.containsKey("message")) {
                notification.setMessage(request.get("message").toString());
            }
            if (request.containsKey("link")) {
                notification.setLink(request.get("link").toString());
            }
            if (request.containsKey("type")) {
                notification.setType(Notification.NotificationType.valueOf(request.get("type").toString()));
            }
            if (request.containsKey("priority")) {
                notification.setPriority(Notification.Priority.valueOf(request.get("priority").toString()));
            }
            if (request.containsKey("isActive")) {
                notification.setIsActive(Boolean.parseBoolean(request.get("isActive").toString()));
            }
            if (request.containsKey("expiresAt")) {
                String expiresAt = request.get("expiresAt").toString();
                notification.setExpiresAt(expiresAt.isEmpty() ? null : LocalDateTime.parse(expiresAt));
            }

            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "Notification updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update notification: " + e.getMessage()));
        }
    }

    /**
     * Delete notification (Admin)
     */
    @DeleteMapping("/admin/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete notification: " + e.getMessage()));
        }
    }

    /**
     * Toggle notification active status (Admin)
     */
    @PutMapping("/admin/{notificationId}/toggle")
    public ResponseEntity<?> toggleNotification(@PathVariable Long notificationId) {
        try {
            Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
            if (notificationOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Notification not found"));
            }

            Notification notification = notificationOptional.get();
            notification.setIsActive(!notification.getIsActive());
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of(
                    "message", "Notification status updated",
                    "isActive", notification.getIsActive()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to toggle notification: " + e.getMessage()));
        }
    }
}
