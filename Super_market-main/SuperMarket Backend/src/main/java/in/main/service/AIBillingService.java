package in.main.service;

import in.main.entities.PaymentTransaction;
import in.main.entities.Subscription;
import in.main.repository.PaymentTransactionRepository;
import in.main.repository.SubscriptionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Billing Service for automated billing operations and fraud detection
 */
@Service
public class AIBillingService {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private AdvancedAIService advancedAIService;

    @Autowired
    private AuditLogService auditLogService;

    // Billing thresholds and settings
    private static final BigDecimal MIN_TRANSACTION_AMOUNT = new BigDecimal("0.01");
    private static final BigDecimal MAX_TRANSACTION_AMOUNT = new BigDecimal("10000.00");
    private static final int FRAUD_CHECK_INTERVAL_MINUTES = 15;
    private static final int AUTO_BILLING_CHECK_HOURS = 1;

    // Fraud detection patterns
    private final Map<String, Integer> fraudPatterns = new HashMap<>();
    private final List<Map<String, Object>> recentTransactions = new ArrayList<>();

    /**
     * Scheduled fraud detection - runs every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void performFraudDetection() {
        try {
            // Get recent transactions for analysis
            LocalDateTime since = LocalDateTime.now().minusHours(1);
            List<PaymentTransaction> recentTxns = paymentTransactionRepository
                .findByCreatedAtAfter(since);

            // Convert to analysis format
            List<Map<String, Object>> transactionData = recentTxns.stream()
                .map(this::convertTransactionToMap)
                .collect(Collectors.toList());

            // Perform fraud detection
            List<Map<String, Object>> fraudAlerts = advancedAIService.detectFraudulentActivity(transactionData);

            // Process fraud alerts
            for (Map<String, Object> alert : fraudAlerts) {
                handleFraudAlert(alert);
            }

            // Update recent transactions cache
            updateTransactionCache(transactionData);

        } catch (Exception e) {
            auditLogService.logAction(
                "FRAUD_DETECTION",
                "AI Billing Service",
                "Fraud detection failed: " + e.getMessage(),
                in.main.entities.AuditLog.ActionStatus.FAILED
            );
        }
    }

    /**
     * Scheduled auto-billing for subscriptions - runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void performAutoBilling() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Find subscriptions due for billing
            List<Subscription> dueSubscriptions = subscriptionRepository
                .findByStatusAndNextBillingDateBefore(Subscription.SubscriptionStatus.ACTIVE, now);

            for (Subscription subscription : dueSubscriptions) {
                processAutoBilling(subscription);
            }

        } catch (Exception e) {
            auditLogService.logAction(
                "AUTO_BILLING",
                "AI Billing Service",
                "Auto-billing failed: " + e.getMessage(),
                in.main.entities.AuditLog.ActionStatus.FAILED
            );
        }
    }

    /**
     * Process automatic billing for a subscription
     */
    private void processAutoBilling(Subscription subscription) {
        try {
            // Check if payment method is valid
            if (!isPaymentMethodValid(subscription)) {
                // Suspend subscription if payment method invalid
                subscription.setStatus(Subscription.SubscriptionStatus.SUSPENDED);
                subscriptionRepository.save(subscription);

                auditLogService.logAction(
                    "AUTO_BILLING",
                    "AI Billing Service",
                    "Subscription suspended due to invalid payment method: " + subscription.getId(),
                    in.main.entities.AuditLog.ActionStatus.FAILED
                );
                return;
            }

            // Calculate billing amount with AI optimization
            BigDecimal billingAmount = calculateOptimizedBillingAmount(subscription);

            // Create payment transaction
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setUser(subscription.getUser());
            transaction.setAmount(billingAmount);
            transaction.setCurrency("USD");
            transaction.setType(PaymentTransaction.PaymentType.SUBSCRIPTION_RENEWAL);
            transaction.setStatus(PaymentTransaction.PaymentStatus.PENDING);
            transaction.setSubscription(subscription);
            transaction.setCreatedAt(LocalDateTime.now());

            // Process payment (simulated)
            boolean paymentSuccess = processPayment(transaction);

            if (paymentSuccess) {
                transaction.setStatus(PaymentTransaction.PaymentStatus.SUCCESS);
                subscription.setNextBillingDate(subscription.getNextBillingDate().plusMonths(1));
                subscription.setLastBillingDate(LocalDateTime.now());

                auditLogService.logAction(
                    "AUTO_BILLING",
                    "AI Billing Service",
                    "Auto-billing successful for subscription: " + subscription.getId() + " - $" + billingAmount,
                    in.main.entities.AuditLog.ActionStatus.SUCCESS
                );
            } else {
                transaction.setStatus(PaymentTransaction.PaymentStatus.FAILED);
                // Increment failure count
                subscription.setBillingFailures(subscription.getBillingFailures() + 1);

                // Suspend after 3 failures
                if (subscription.getBillingFailures() >= 3) {
                    subscription.setStatus(Subscription.SubscriptionStatus.SUSPENDED);
                }

                auditLogService.logAction(
                    "AUTO_BILLING",
                    "AI Billing Service",
                    "Auto-billing failed for subscription: " + subscription.getId(),
                    in.main.entities.AuditLog.ActionStatus.FAILED
                );
            }

            paymentTransactionRepository.save(transaction);
            subscriptionRepository.save(subscription);

        } catch (Exception e) {
            auditLogService.logAction(
                "AUTO_BILLING",
                "AI Billing Service",
                "Error processing auto-billing for subscription: " + subscription.getId() + " - " + e.getMessage(),
                in.main.entities.AuditLog.ActionStatus.FAILED
            );
        }
    }

    /**
     * Handle fraud alert
     */
    private void handleFraudAlert(Map<String, Object> alert) {
        try {
            Long transactionId = ((Number) alert.get("transactionId")).longValue();
            String riskLevel = (String) alert.get("riskLevel");

            // Flag transaction as suspicious
            Optional<PaymentTransaction> optTxn = paymentTransactionRepository.findById(transactionId);
            if (optTxn.isPresent()) {
                PaymentTransaction txn = optTxn.get();
                txn.setFraudFlag(true);
                txn.setFraudReason((String) alert.get("reason"));
                paymentTransactionRepository.save(txn);

                // Log fraud detection
                auditLogService.logAction(
                    "FRAUD_ALERT",
                    "AI Billing Service",
                    "Fraud detected in transaction " + transactionId + " - Risk: " + riskLevel,
                    in.main.entities.AuditLog.ActionStatus.SUCCESS
                );

                // For high-risk transactions, suspend related subscription
                if ("HIGH".equals(riskLevel) && txn.getSubscriptionId() != null) {
                    Optional<Subscription> optSub = subscriptionRepository.findById(txn.getSubscriptionId());
                    if (optSub.isPresent()) {
                        Subscription sub = optSub.get();
                        sub.setStatus(Subscription.SubscriptionStatus.SUSPENDED);
                        subscriptionRepository.save(sub);
                    }
                }
            }

        } catch (Exception e) {
            auditLogService.logAction(
                "FRAUD_ALERT",
                "AI Billing Service",
                "Error handling fraud alert: " + e.getMessage(),
                in.main.entities.AuditLog.ActionStatus.FAILED
            );
        }
    }

    /**
     * Calculate optimized billing amount using AI
     */
    private BigDecimal calculateOptimizedBillingAmount(Subscription subscription) {
        // Base amount determined by plan type
        BigDecimal baseAmount;
        switch (subscription.getPlanType()) {
            case BASIC:
                baseAmount = new BigDecimal("9.99");
                break;
            case STANDARD:
                baseAmount = new BigDecimal("19.99");
                break;
            case PREMIUM:
                baseAmount = new BigDecimal("49.99");
                break;
            case ENTERPRISE:
                baseAmount = new BigDecimal("199.99");
                break;
            case FREE_TRIAL:
            default:
                baseAmount = BigDecimal.ZERO;
                break;
        }

        // AI-based adjustments
        try {
            // Analyze usage patterns to suggest optimal pricing
            List<Map<String, Object>> usageData = getSubscriptionUsageData(subscription.getId());

            if (!usageData.isEmpty()) {
                // Use AI to analyze usage and suggest pricing adjustments
                Map<String, Object> insights = advancedAIService.generateAIInsights(usageData);

                // Simple adjustment based on usage intensity
                @SuppressWarnings("unchecked")
                Map<String, Object> metrics = (Map<String, Object>) insights.get("metrics");
                if (metrics != null) {
                    Double avgOrderValue = ((Number) metrics.getOrDefault("averageOrderValue", 0.0)).doubleValue();

                    // Adjust price based on usage value
                    if (avgOrderValue > 200) {
                        baseAmount = baseAmount.multiply(new BigDecimal("1.1")); // 10% increase for high-value users
                    } else if (avgOrderValue < 50) {
                        baseAmount = baseAmount.multiply(new BigDecimal("0.95")); // 5% discount for low-value users
                    }
                }
            }

        } catch (Exception e) {
            // Fallback to base amount
        }

        return baseAmount;
    }

    /**
     * Validate payment method
     */
    private boolean isPaymentMethodValid(Subscription subscription) {
        // Placeholder - in real implementation, this would validate with payment processor
        return subscription.getPaymentMethodId() != null && !subscription.getPaymentMethodId().isEmpty();
    }

    /**
     * Process payment (simulated)
     */
    private boolean processPayment(PaymentTransaction transaction) {
        // Simulate payment processing with success rate based on amount
        BigDecimal amount = transaction.getAmount();

        // Higher amounts have slightly lower success rate (simulating risk)
        double successRate = amount.compareTo(new BigDecimal("100")) > 0 ? 0.95 : 0.98;

        return Math.random() < successRate;
    }

    /**
     * Get billing analytics
     */
    public Map<String, Object> getBillingAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();

        try {
            List<PaymentTransaction> transactions = paymentTransactionRepository
                .findByCreatedAtBetween(startDate, endDate);

            // Basic metrics
            BigDecimal totalRevenue = transactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.PaymentStatus.SUCCESS)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            long successfulTransactions = transactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.PaymentStatus.SUCCESS)
                .count();

            long failedTransactions = transactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.PaymentStatus.FAILED)
                .count();

            long fraudTransactions = transactions.stream()
                .filter(PaymentTransaction::isFraudFlag)
                .count();

            // AI insights
            List<Map<String, Object>> transactionData = transactions.stream()
                .map(this::convertTransactionToMap)
                .collect(Collectors.toList());

            Map<String, Object> insights = advancedAIService.generateAIInsights(transactionData);

            analytics.put("totalRevenue", totalRevenue);
            analytics.put("successfulTransactions", successfulTransactions);
            analytics.put("failedTransactions", failedTransactions);
            analytics.put("fraudTransactions", fraudTransactions);
            analytics.put("aiInsights", insights);

        } catch (Exception e) {
            analytics.put("error", "Failed to generate billing analytics: " + e.getMessage());
        }

        return analytics;
    }

    /**
     * Manually trigger billing for a subscription
     */
    public boolean triggerManualBilling(Long subscriptionId) {
        Optional<Subscription> optSub = subscriptionRepository.findById(subscriptionId);
        if (optSub.isPresent()) {
            processAutoBilling(optSub.get());
            return true;
        }
        return false;
    }

    /**
     * Get fraud detection status
     */
    public Map<String, Object> getFraudDetectionStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("patternsDetected", fraudPatterns.size());
        status.put("recentTransactionsAnalyzed", recentTransactions.size());
        status.put("lastCheck", LocalDateTime.now());
        return status;
    }

    // Helper methods

    private Map<String, Object> convertTransactionToMap(PaymentTransaction txn) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", txn.getId());
        map.put("amount", txn.getAmount());
        map.put("userId", txn.getUserId());
        map.put("timestamp", txn.getCreatedAt());
        map.put("type", txn.getType());
        map.put("status", txn.getStatus());
        return map;
    }

    private void updateTransactionCache(List<Map<String, Object>> transactions) {
        recentTransactions.clear();
        recentTransactions.addAll(transactions);

        // Keep only last 1000 transactions in cache
        if (recentTransactions.size() > 1000) {
            recentTransactions.subList(0, recentTransactions.size() - 1000).clear();
        }
    }

    private List<Map<String, Object>> getSubscriptionUsageData(Long subscriptionId) {
        // Placeholder - in real implementation, this would query usage data
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("subscriptionId", subscriptionId);
            entry.put("orderValue", 50 + Math.random() * 200);
            entry.put("date", LocalDateTime.now().minusDays(i));
            data.add(entry);
        }
        return data;
    }
}
