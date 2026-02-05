package in.main.entities;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime trialEndDate;

    private boolean isTrialActive;
    private boolean autoRenew;

    private String razorpaySubscriptionId;
    private String razorpayPaymentId;
    private String razorpayOrderId;

    // Acurato fields (alternative payment provider)
    private String acuratoPaymentId;
    private String acuratoOrderId;

    private java.math.BigDecimal amountPaid;
    private String currency;

    private LocalDateTime lastPaymentDate;
    private LocalDateTime nextBillingDate;
    private LocalDateTime lastBillingDate;
    private Integer billingFailures = 0;
    private String paymentMethodId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateTime trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public boolean isTrialActive() {
        return isTrialActive;
    }

    public void setTrialActive(boolean trialActive) {
        isTrialActive = trialActive;
    }

    public boolean isAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public String getRazorpaySubscriptionId() {
        return razorpaySubscriptionId;
    }

    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) {
        this.razorpaySubscriptionId = razorpaySubscriptionId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getAcuratoPaymentId() {
        return acuratoPaymentId;
    }

    public void setAcuratoPaymentId(String acuratoPaymentId) {
        this.acuratoPaymentId = acuratoPaymentId;
    }

    public String getAcuratoOrderId() {
        return acuratoOrderId;
    }

    public void setAcuratoOrderId(String acuratoOrderId) {
        this.acuratoOrderId = acuratoOrderId;
    }

    public java.math.BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(java.math.BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
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

    // Billing related helpers
    public LocalDateTime getNextBillingDate() {
        return nextBillingDate;
    }

    public void setNextBillingDate(LocalDateTime nextBillingDate) {
        this.nextBillingDate = nextBillingDate;
    }

    public LocalDateTime getLastBillingDate() {
        return lastBillingDate;
    }

    public void setLastBillingDate(LocalDateTime lastBillingDate) {
        this.lastBillingDate = lastBillingDate;
    }

    public Integer getBillingFailures() {
        return billingFailures;
    }

    public void setBillingFailures(Integer billingFailures) {
        this.billingFailures = billingFailures;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    // PlanType enum moved to separate PlanType.java file for better reusability

    public enum SubscriptionStatus {
        TRIAL,
        ACTIVE,
        EXPIRED,
        CANCELLED,
        SUSPENDED
    }
}
