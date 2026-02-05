package in.main.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Onboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "is_skipped")
    private Boolean isSkipped = false;

    @Column(name = "current_step")
    private Integer currentStep = 1;

    @Column(name = "personal_info_completed")
    private Boolean personalInfoCompleted = false;

    @Column(name = "shop_details_completed")
    private Boolean shopDetailsCompleted = false;

    @Column(name = "documents_uploaded")
    private Boolean documentsUploaded = false;

    @Column(name = "gst_certificate_path")
    private String gstCertificatePath;

    @Column(name = "shop_registration_certificate_path")
    private String shopRegistrationCertificatePath;

    @Column(name = "pan_card_path")
    private String panCardPath;

    @Column(name = "aadhaar_card_path")
    private String aadhaarCardPath;

    @Column(name = "other_documents_paths")
    private String otherDocumentsPaths; // JSON array of paths

    @Column(name = "business_info")
    private String businessInfo; // JSON string with additional business info

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (isCompleted && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
