package in.main.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.dto.SubscriptionResponse;
import in.main.entities.SubscriptionPlan;
import in.main.repository.PaymentTransactionRepository;
import in.main.repository.SubscriptionPlanRepository;
import in.main.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscription")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    private Long resolveUserId(Long headerUserId) {
        if (headerUserId != null) return headerUserId;
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                Object principal = auth.getPrincipal();
                if (principal instanceof Long) return (Long) principal;
                if (principal instanceof String) return Long.valueOf((String) principal);
            }
        } catch (Exception ignored) {}
        return null;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(@RequestHeader(value = "userId", required = false) Long userId) {
        try {
            Long uid = resolveUserId(userId);
            if (uid == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            SubscriptionResponse subscription = subscriptionService.getUserSubscription(uid);
            if (subscription == null) {
                return ResponseEntity.ok(Map.of("hasSubscription", false));
            }
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch subscription: " + e.getMessage()));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getSubscription(@RequestHeader(value = "userId", required = false) Long userId) {
        return getSubscriptionStatus(userId);
    }

    @GetMapping("/check-active")
    public ResponseEntity<?> checkSubscriptionActive(@RequestHeader(value = "userId", required = false) Long userId) {
        try {
            Long uid = resolveUserId(userId);
            if (uid == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            boolean isActive = subscriptionService.isSubscriptionActive(uid);
            return ResponseEntity.ok(Map.of("isActive", isActive));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to check subscription: " + e.getMessage()));
        }
    }

    @PostMapping("/subscribe/{planId}")
    public ResponseEntity<?> subscribeToPlan(@PathVariable Long planId, @RequestHeader(value = "userId", required = false) Long userId, @RequestParam(value = "provider", required = false) String provider) {
        try {
            Long uid = resolveUserId(userId);
            if (uid == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

            SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            if (!plan.getIsActive()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Plan is not active"));
            }

            // Handle free plans without calling Razorpay
            if (plan.getPrice() == null || Double.compare(plan.getPrice(), 0.0) == 0) {
                // Start free trial / immediate activation
                subscriptionService.startFreeTrial(uid);
                Map<String, Object> result = new HashMap<>();
                result.put("order", null);
                result.put("plan", Map.of(
                    "id", plan.getId(),
                    "name", plan.getPlanName(),
                    "price", plan.getPrice() != null ? plan.getPrice() : 0.0,
                    "durationDays", plan.getDurationDays(),
                    "freeTrial", true
                ));
                return ResponseEntity.ok(result);
            }

            // Create order (supports multiple providers via request param 'provider')
            // Default provider is Razorpay; frontend can pass provider = "acurato" to use Acurato
            String effectiveProvider = (provider == null || provider.isBlank()) ? "razorpay" : provider;
            Map<String, Object> orderData = subscriptionService.createOrder(uid, plan.getPlanType().name(), plan.getPrice(), effectiveProvider);

            return ResponseEntity.ok(Map.of(
                "order", orderData,
                "provider", effectiveProvider,
                "plan", Map.of(
                    "id", plan.getId(),
                    "name", plan.getPlanName(),
                    "price", plan.getPrice(),
                    "durationDays", plan.getDurationDays()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to create subscription order: " + e.getMessage()));
        }
    }

    @PostMapping("/cancel-order")
    public ResponseEntity<?> cancelOrder(@RequestBody Map<String, String> body) {
        try {
            final String orderId = body.get("orderId");
            if (orderId == null || orderId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing orderId"));
            }

            var optTx = paymentTransactionRepository.findByRazorpayOrderId(orderId);
            if (optTx.isPresent()) {
                var tx = optTx.get();
                tx.setStatus(in.main.entities.PaymentTransaction.PaymentStatus.FAILED);
                paymentTransactionRepository.save(tx);
                return ResponseEntity.ok(Map.of("status", "cancelled", "orderId", orderId));
            } else {
                // Not found: record a cancelled transaction placeholder
                return ResponseEntity.ok(Map.of("status", "not_found", "orderId", orderId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }
}
