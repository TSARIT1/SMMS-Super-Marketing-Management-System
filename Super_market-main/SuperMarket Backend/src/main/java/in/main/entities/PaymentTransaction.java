package in.main.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(name = "subscription_id", insertable = false, updatable = false)
    private Long subscriptionId;

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;

    // Acurato payment provider fields
    private String acuratoPaymentId;
    private String acuratoOrderId;
    private String acuratoSignature;

    private BigDecimal amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    public enum PaymentType {
        SUBSCRIPTION_RENEWAL,
        ONE_TIME,
        REFUND
    }

    private String description;
    private LocalDateTime transactionDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Fraud detection fields
    private boolean fraudFlag;
    private String fraudReason;



    // Retry and failure tracking
    private int retryCount;
    private int maxRetries;
    private LocalDateTime nextRetryAt;
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        transactionDate = LocalDateTime.now();
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

    public Subscription getSubscription() {
        return subscription;
    }

    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
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

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
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

    public String getAcuratoSignature() {
        return acuratoSignature;
    }

    public void setAcuratoSignature(String acuratoSignature) {
        this.acuratoSignature = acuratoSignature;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    // Convenience and compatibility helpers
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public Long getSubscriptionId() {
        return subscription != null ? subscription.getId() : null;
    }

    public LocalDateTime getCreatedAt() {
        return transactionDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.transactionDate = createdAt;
    }

    public boolean isFraudFlag() {
        return fraudFlag;
    }

    public void setFraudFlag(boolean fraudFlag) {
        this.fraudFlag = fraudFlag;
    }

    public PaymentType getType() {
        return type;
    }

    public void setType(PaymentType type) {
        this.type = type;
    }

    public String getFraudReason() {
        return fraudReason;
    }

    public void setFraudReason(String fraudReason) {
        this.fraudReason = fraudReason;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public int getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    public LocalDateTime getNextRetryAt() {
        return nextRetryAt;
    }

    public void setNextRetryAt(LocalDateTime nextRetryAt) {
        this.nextRetryAt = nextRetryAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED,
        REFUNDED
    }

    public enum PaymentMethod {
        CARD,
        UPI,
        NETBANKING,
        WALLET
    }

}
