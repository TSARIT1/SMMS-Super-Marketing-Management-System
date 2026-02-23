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

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public Boolean getIsSkipped() {
        return isSkipped;
    }

    public void setIsSkipped(Boolean isSkipped) {
        this.isSkipped = isSkipped;
    }

    public Integer getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(Integer currentStep) {
        this.currentStep = currentStep;
    }

    public Boolean getPersonalInfoCompleted() {
        return personalInfoCompleted;
    }

    public void setPersonalInfoCompleted(Boolean personalInfoCompleted) {
        this.personalInfoCompleted = personalInfoCompleted;
    }

    public Boolean getShopDetailsCompleted() {
        return shopDetailsCompleted;
    }

    public void setShopDetailsCompleted(Boolean shopDetailsCompleted) {
        this.shopDetailsCompleted = shopDetailsCompleted;
    }

    public Boolean getDocumentsUploaded() {
        return documentsUploaded;
    }

    public void setDocumentsUploaded(Boolean documentsUploaded) {
        this.documentsUploaded = documentsUploaded;
    }

    public String getGstCertificatePath() {
        return gstCertificatePath;
    }

    public void setGstCertificatePath(String gstCertificatePath) {
        this.gstCertificatePath = gstCertificatePath;
    }

    public String getShopRegistrationCertificatePath() {
        return shopRegistrationCertificatePath;
    }

    public void setShopRegistrationCertificatePath(String shopRegistrationCertificatePath) {
        this.shopRegistrationCertificatePath = shopRegistrationCertificatePath;
    }

    public String getPanCardPath() {
        return panCardPath;
    }

    public void setPanCardPath(String panCardPath) {
        this.panCardPath = panCardPath;
    }

    public String getAadhaarCardPath() {
        return aadhaarCardPath;
    }

    public void setAadhaarCardPath(String aadhaarCardPath) {
        this.aadhaarCardPath = aadhaarCardPath;
    }

    public String getOtherDocumentsPaths() {
        return otherDocumentsPaths;
    }

    public void setOtherDocumentsPaths(String otherDocumentsPaths) {
        this.otherDocumentsPaths = otherDocumentsPaths;
    }

    public String getBusinessInfo() {
        return businessInfo;
    }

    public void setBusinessInfo(String businessInfo) {
        this.businessInfo = businessInfo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
         

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
                 