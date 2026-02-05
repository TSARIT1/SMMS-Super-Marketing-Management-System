package in.main.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import in.main.dto.SubscriptionResponse;
import in.main.entities.PaymentTransaction;
import in.main.entities.PlanType;
import in.main.entities.Subscription;
import in.main.entities.User;
import in.main.repository.PaymentTransactionRepository;
import in.main.repository.SubscriptionRepository;
import in.main.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.main.service.payment.AcuratoClient;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Value("${subscription.trial.days}")
    private int trialDays;

    @Autowired
    private AcuratoClient acuratoClient;

    // Create Razorpay Order
    public Map<String, Object> createOrder(Long userId, String planType, Double amount) throws RazorpayException {
        return createOrder(userId, planType, amount, "razorpay");
    }

    public Map<String, Object> createOrder(Long userId, String planType, Double amount, String provider) throws RazorpayException {
        if (provider == null) provider = "razorpay";
        if (provider.equalsIgnoreCase("acurato")) {
            // Use Acurato client
            return acuratoClient.createOrder(amount, currency);
        }

        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // Amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", order.get("id"));
        result.put("amount", amount);
        result.put("currency", currency);
        result.put("keyId", razorpayKeyId);
        return result;
    }

    // Verify Payment Signature
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        return verifyPaymentSignature(orderId, paymentId, signature, "razorpay");
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature, String provider) {
        if (provider == null) provider = "razorpay";
        if (provider.equalsIgnoreCase("acurato")) {
            return acuratoClient.verifySignature(orderId, paymentId, signature);
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
            return true;
        } catch (RazorpayException e) {
            return false;
        }
    }

    // Process Payment and Create/Update Subscription
    @Transactional
    public Subscription processPayment(Long userId, String planType, String paymentId, String orderId, String signature, Double amount) {
        return processPayment(userId, planType, paymentId, orderId, signature, amount, "razorpay");
    }

    @Transactional
    public Subscription processPayment(Long userId, String planType, String paymentId, String orderId, String signature, Double amount, String provider) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save Payment Transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setUser(user);
        transaction.setAmount(java.math.BigDecimal.valueOf(amount));
        transaction.setCurrency(currency);
        transaction.setStatus(PaymentTransaction.PaymentStatus.SUCCESS);
        transaction.setDescription("Subscription payment for " + planType);

        if (provider != null && provider.equalsIgnoreCase("acurato")) {
            transaction.setAcuratoPaymentId(paymentId);
            transaction.setAcuratoOrderId(orderId);
            transaction.setAcuratoSignature(signature);
        } else {
            transaction.setRazorpayPaymentId(paymentId);
            transaction.setRazorpayOrderId(orderId);
            transaction.setRazorpaySignature(signature);
        }

        paymentTransactionRepository.save(transaction);

        // Create or Update Subscription
        Subscription subscription = subscriptionRepository.findByUser(user)
                .orElse(new Subscription());

        subscription.setUser(user);
        subscription.setPlanType(PlanType.valueOf(planType.toUpperCase()));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        subscription.setTrialActive(false);
        subscription.setAutoRenew(true);
        if (provider != null && provider.equalsIgnoreCase("acurato")) {
            subscription.setAcuratoPaymentId(paymentId);
            subscription.setAcuratoOrderId(orderId);
        } else {
            subscription.setRazorpayPaymentId(paymentId);
            subscription.setRazorpayOrderId(orderId);
        }
        subscription.setAmountPaid(java.math.BigDecimal.valueOf(amount));
        subscription.setCurrency(currency);
        subscription.setLastPaymentDate(LocalDateTime.now());

        transaction.setSubscription(subscription);

        return subscriptionRepository.save(subscription);
    }

    // Start Free Trial
    @Transactional
    public Subscription startFreeTrial(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If a subscription already exists for this user, update it to a free trial instead of creating duplicates
        Subscription subscription = subscriptionRepository.findByUser(user).orElse(null);
        if (subscription == null) {
            subscription = new Subscription();
            subscription.setUser(user);
        }

        subscription.setPlanType(PlanType.FREE_TRIAL);
        subscription.setStatus(Subscription.SubscriptionStatus.TRIAL);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setTrialEndDate(LocalDateTime.now().plusDays(trialDays));
        subscription.setEndDate(LocalDateTime.now().plusDays(trialDays));
        subscription.setTrialActive(true);
        subscription.setAutoRenew(false);
        subscription.setCurrency(currency);

        return subscriptionRepository.save(subscription);
    }

    // Get User Subscription
    public SubscriptionResponse getUserSubscription(Long userId) {
        Subscription subscription = subscriptionRepository.findByUser_Id(userId)
                .orElse(null);

        if (subscription == null) {
            return null;
        }

        SubscriptionResponse response = new SubscriptionResponse();
        response.setId(subscription.getId());
        response.setPlanType(subscription.getPlanType().name());
        response.setStatus(subscription.getStatus().name());
        response.setStartDate(subscription.getStartDate().toString());
        response.setEndDate(subscription.getEndDate() != null ? subscription.getEndDate().toString() : null);
        response.setTrialEndDate(subscription.getTrialEndDate() != null ? subscription.getTrialEndDate().toString() : null);
        response.setTrialActive(subscription.isTrialActive());
        response.setAmountPaid(subscription.getAmountPaid() != null ? subscription.getAmountPaid().doubleValue() : null);

        // Calculate days remaining
        if (subscription.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getEndDate());
            response.setDaysRemaining((int) Math.max(0, days));
        }

        return response;
    }

    // Check if subscription is active
    public boolean isSubscriptionActive(Long userId) {
        Subscription subscription = subscriptionRepository.findByUser_Id(userId)
                .orElse(null);

        if (subscription == null) {
            return false;
        }

        if (subscription.getStatus() == Subscription.SubscriptionStatus.ACTIVE ||
            subscription.getStatus() == Subscription.SubscriptionStatus.TRIAL) {
            return subscription.getEndDate() != null && subscription.getEndDate().isAfter(LocalDateTime.now());
        }

        return false;
    }
}
