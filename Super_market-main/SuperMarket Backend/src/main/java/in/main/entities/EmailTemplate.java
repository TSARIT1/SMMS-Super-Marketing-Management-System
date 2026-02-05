package in.main.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
@Data
public class EmailTemplate {

    public enum EmailType {
        WELCOME,
        SUPPORT,
        TICKET_UPDATE,
        MARKETING,
        PLAN_UPGRADE,
        PLAN_PROMOTION,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        ACCOUNT_ACTIVATED,
        PASSWORD_RESET,
        NEWSLETTER,
        SYSTEM_NOTIFICATION
    }

    public enum TemplateStatus {
        ACTIVE,
        INACTIVE,
        DRAFT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailType emailType;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(length = 100)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TemplateStatus status = TemplateStatus.ACTIVE;

    @Column(nullable = false)
    private Boolean isAiGenerated = false;

    @Column(length = 100)
    private String createdBy;

    @Column(length = 100)
    private String updatedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean isHtml = true;

    @Column(length = 50)
    private String language = "en";

    @Column(length = 100)
    private String category;

    // Variables that can be used in templates
    @Column(columnDefinition = "TEXT")
    private String availableVariables; // JSON string of available variables

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
