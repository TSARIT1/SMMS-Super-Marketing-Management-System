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

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public EmailStatus getStatus() {
        return status;
    }

    public void setStatus(EmailStatus status) {
        this.status = status;
    }

    public EmailPriority getPriority() {
        return priority;
    }

    public void setPriority(EmailPriority priority) {
        this.priority = priority;
    }

    public String getEmailType() {
        return emailType;
    }

    public void setEmailType(String emailType) {
        this.emailType = emailType;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public Long getSentBy() {
        return sentBy;
    }

    public void setSentBy(Long sentBy) {
        this.sentBy = sentBy;
    }

    public String getSentByName() {
        return sentByName;
    }

    public void setSentByName(String sentByName) {
        this.sentByName = sentByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public LocalDateTime getNextRetryAt() {
        return nextRetryAt;
    }

    public void setNextRetryAt(LocalDateTime nextRetryAt) {
        this.nextRetryAt = nextRetryAt;
    }

    public Boolean getIsOpened() {
        return isOpened;
    }

    public void setIsOpened(Boolean isOpened) {
        this.isOpened = isOpened;
    }

    public Boolean getIsClicked() {
        return isClicked;
    }

    public void setIsClicked(Boolean isClicked) {
        this.isClicked = isClicked;
    }
}
