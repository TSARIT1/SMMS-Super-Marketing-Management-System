package in.main.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Data
public class EmailLog {

    public enum EmailStatus {
        SENT,
        FAILED,
        PENDING,
        BOUNCED,
        DELIVERED,
        OPENED,
        CLICKED
    }

    public enum EmailPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(length = 255)
    private String recipientName;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status = EmailStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private EmailPriority priority = EmailPriority.NORMAL;

    @Column(length = 100)
    private String emailType; // WELCOME, SUPPORT, etc.

    @Column(length = 100)
    private String templateName;

    @Column(nullable = false)
    private Long sentBy; // User ID who triggered the email

    @Column(length = 100)
    private String sentByName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime openedAt;

    private LocalDateTime clickedAt;

    @Column(length = 500)
    private String errorMessage;

    @Column(length = 100)
    private String smtpResponse;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 100)
    private String userAgent;

    // Email tracking
    @Column(length = 255)
    private String trackingId;

    @Column(length = 255)
    private String unsubscribeToken;

    // Related entity IDs
    private Long userId;
    private Long ticketId;
    private Long subscriptionId;
    private Long orderId;

    // AI related fields
    @Column(nullable = false)
    private Boolean isAiGenerated = false;

    @Column(length = 100)
    private String aiModelUsed;

    @Column(columnDefinition = "TEXT")
    private String aiPromptUsed;

    // Retry information
    @Column(nullable = false)
    private Integer retryCount = 0;

    @Column(nullable = false)
    private Integer maxRetries = 3;

    private LocalDateTime nextRetryAt;

    // Campaign information
    @Column(length = 100)
    private String campaignName;

    @Column(length = 50)
    private String campaignCategory;

    // Performance metrics
    @Column(nullable = false)
    private Boolean isOpened = false;

    @Column(nullable = false)
    private Boolean isClicked = false;

    @Column(nullable = false)
    private Integer clickCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (trackingId == null) {
            trackingId = java.util.UUID.randomUUID().toString();
        }
        if (unsubscribeToken == null) {
            unsubscribeToken = java.util.UUID.randomUUID().toString();
        }
    }
}
