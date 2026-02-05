package in.main.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;

import in.main.dto.CreateOrderRequest;
import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.dto.PaymentVerificationRequest;
import in.main.entities.AuditLog;
import in.main.entities.Profile;
import in.main.entities.Subscription;
import in.main.entities.User;
import in.main.repository.AuditLogRepository;
import in.main.repository.ProfileRepository;
import in.main.repository.UserRepository;
import in.main.service.SubscriptionService;
import in.main.service.payment.PayUService;
import in.main.service.payment.PaytmService;
import in.main.service.payment.PhonePeService;
import in.main.service.payment.RazorpayService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class PaymentController {

    @Autowired
    private SubscriptionService subscriptionService;
    
    @Autowired(required = false)
    private RazorpayService razorpayPaymentService;
    
    @Autowired(required = false)
    private PhonePeService phonePeService;
    
    @Autowired(required = false)
    private PaytmService paytmService;
    
    @Autowired(required = false)
    private PayUService payUService;
    
    @Autowired(required = false)
    private ProfileRepository profileRepository;
    
    @Autowired(required = false)
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private AuditLogRepository auditLogRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, @RequestHeader("userId") Long userId) {
        try {
            Map<String, Object> orderData = subscriptionService.createOrder(userId, request.getPlanType(), request.getAmount(), request.getProvider());
            return ResponseEntity.ok(orderData);
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request, @RequestHeader("userId") Long userId) {
        try {
            String provider = request.getProvider();
            boolean isValid;
            if (provider != null && provider.equalsIgnoreCase("acurato")) {
                isValid = subscriptionService.verifyPaymentSignature(
                        request.getAcurato_order_id(),
                        request.getAcurato_payment_id(),
                        request.getAcurato_signature(),
                        "acurato"
                );
            } else {
                isValid = subscriptionService.verifyPaymentSignature(
                        request.getRazorpay_order_id(),
                        request.getRazorpay_payment_id(),
                        request.getRazorpay_signature(),
                        "razorpay"
                );
            }

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid payment signature"));
            }

            Subscription subscription;
            if (provider != null && provider.equalsIgnoreCase("acurato")) {
                subscription = subscriptionService.processPayment(
                        userId,
                        request.getPlanType(),
                        request.getAcurato_payment_id(),
                        request.getAcurato_order_id(),
                        request.getAcurato_signature(),
                        request.getAmount(),
                        "acurato"
                );
            } else {
                subscription = subscriptionService.processPayment(
                        userId,
                        request.getPlanType(),
                        request.getRazorpay_payment_id(),
                        request.getRazorpay_order_id(),
                        request.getRazorpay_signature(),
                        request.getAmount(),
                        "razorpay"
                );
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully",
                    "subscriptionId", subscription.getId(),
                    "planType", subscription.getPlanType(),
                    "status", subscription.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/start-trial")
    public ResponseEntity<?> startFreeTrial(@RequestHeader("userId") Long userId) {
        try {
            Subscription subscription = subscriptionService.startFreeTrial(userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Free trial started successfully",
                    "subscriptionId", subscription.getId(),
                    "trialEndDate", subscription.getTrialEndDate(),
                    "daysRemaining", 5
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start trial: " + e.getMessage()));
        }
    }
    
    // ========== POS Payment Gateway Endpoints ==========
    
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(@RequestBody PaymentInitiateRequest request) {
        try {
            if (profileRepository == null || userRepository == null) {
                return createErrorResponse("Payment gateway services not available", HttpStatus.SERVICE_UNAVAILABLE);
            }
            
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return createErrorResponse("User not found", HttpStatus.NOT_FOUND);
            }
            
            Profile profile = profileRepository.findByUser(user).orElse(null);
            if (profile == null) {
                return createErrorResponse("User profile not found", HttpStatus.NOT_FOUND);
            }
            
            PaymentInitiateResponse response;
            String gateway = request.getGateway().toLowerCase();
            
            switch (gateway) {
                case "razorpay":
                    if (razorpayPaymentService == null || !razorpayPaymentService.isEnabled(profile)) {
                        return createDisabledGatewayResponse("Razorpay");
                    }
                    response = razorpayPaymentService.initiatePayment(request, profile);
                    break;
                    
                case "phonepe":
                    if (phonePeService == null || !phonePeService.isEnabled(profile)) {
                        return createDisabledGatewayResponse("PhonePe");
                    }
                    response = phonePeService.initiatePayment(request, profile);
                    break;
                    
                case "paytm":
                    if (paytmService == null || !paytmService.isEnabled(profile)) {
                        return createDisabledGatewayResponse("Paytm");
                    }
                    response = paytmService.initiatePayment(request, profile);
                    break;
                    
                case "payu":
                    if (payUService == null || !payUService.isEnabled(profile)) {
                        return createDisabledGatewayResponse("PayU");
                    }
                    response = payUService.initiatePayment(request, profile);
                    break;
                    
                default:
                    return createErrorResponse("Unsupported payment gateway: " + gateway, HttpStatus.BAD_REQUEST);
            }
            
            logAuditEvent(request.getUserId(), "PAYMENT_INITIATED", 
                         "Gateway: " + gateway + ", Amount: " + request.getAmount(),
                         response.getStatus().equals("success") ? "SUCCESS" : "FAILED");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logAuditEvent(request.getUserId(), "PAYMENT_FAILED", "Error: " + e.getMessage(), "ERROR");
            return createErrorResponse("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/webhooks/razorpay")
    public ResponseEntity<Map<String, String>> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestParam(required = false) Long userId) {
        
        try {
            if (razorpayPaymentService == null || profileRepository == null || userRepository == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                   .body(Map.of("status", "error", "message", "Service unavailable"));
            }
            
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            Profile profile = user != null ? profileRepository.findByUser(user).orElse(null) : null;
            if (profile == null || !razorpayPaymentService.verifyWebhookSignature(payload, signature, profile)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                   .body(Map.of("status", "error", "message", "Invalid signature"));
            }
            
            logAuditEvent(userId, "PAYMENT_SUCCESS", "Razorpay webhook received", "SUCCESS");
            return ResponseEntity.ok(Map.of("status", "success"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/webhooks/phonepe")
    public ResponseEntity<Map<String, String>> handlePhonePeWebhook(
            @RequestBody String payload,
            @RequestHeader("X-VERIFY") String signature,
            @RequestParam(required = false) Long userId) {
        
        try {
            if (phonePeService == null || profileRepository == null || userRepository == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                   .body(Map.of("status", "error", "message", "Service unavailable"));
            }
            
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            Profile profile = user != null ? profileRepository.findByUser(user).orElse(null) : null;
            if (profile == null || !phonePeService.verifyWebhookSignature(payload, signature, profile)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                   .body(Map.of("status", "error", "message", "Invalid signature"));
            }
            
            logAuditEvent(userId, "PAYMENT_SUCCESS", "PhonePe webhook received", "SUCCESS");
            return ResponseEntity.ok(Map.of("status", "success"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/webhooks/paytm")
    public ResponseEntity<Map<String, String>> handlePaytmWebhook(
            @RequestBody Map<String, String> payload,
            @RequestParam(required = false) Long userId) {
        
        try {
            if (paytmService == null || profileRepository == null || userRepository == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                   .body(Map.of("status", "error", "message", "Service unavailable"));
            }
            
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            Profile profile = user != null ? profileRepository.findByUser(user).orElse(null) : null;
            String checksum = payload.get("CHECKSUMHASH");
            
            if (profile == null || !paytmService.verifyWebhookSignature(payload.toString(), checksum, profile)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                   .body(Map.of("status", "error", "message", "Invalid checksum"));
            }
            
            logAuditEvent(userId, "PAYMENT_SUCCESS", "Paytm webhook received", "SUCCESS");
            return ResponseEntity.ok(Map.of("status", "success"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/webhooks/payu")
    public ResponseEntity<Map<String, String>> handlePayUWebhook(
            @RequestBody Map<String, String> payload,
            @RequestParam(required = false) Long userId) {
        
        try {
            if (payUService == null || profileRepository == null || userRepository == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                   .body(Map.of("status", "error", "message", "Service unavailable"));
            }
            
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            Profile profile = user != null ? profileRepository.findByUser(user).orElse(null) : null;
            String hash = payload.get("hash");
            
            if (profile == null || !payUService.verifyWebhookSignature(payload.toString(), hash, profile)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                   .body(Map.of("status", "error", "message", "Invalid hash"));
            }
            
            logAuditEvent(userId, "PAYMENT_SUCCESS", "PayU webhook received", "SUCCESS");
            return ResponseEntity.ok(Map.of("status", "success"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    private ResponseEntity<PaymentInitiateResponse> createErrorResponse(String message, HttpStatus status) {
        PaymentInitiateResponse errorResponse = new PaymentInitiateResponse();
        errorResponse.setStatus("error");
        errorResponse.setMessage(message);
        return ResponseEntity.status(status).body(errorResponse);
    }
    
    private ResponseEntity<PaymentInitiateResponse> createDisabledGatewayResponse(String gatewayName) {
        return createErrorResponse(gatewayName + " is not enabled or configured properly", HttpStatus.BAD_REQUEST);
    }
    
    private void logAuditEvent(Long userId, String action, String description, String status) {
        try {
            if (auditLogRepository != null && userId != null) {
                AuditLog log = new AuditLog();
                log.setUserId(userId);
                log.setActionType(AuditLog.ActionType.valueOf(action.contains("SUCCESS") ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED"));
                log.setEntityType(AuditLog.EntityType.PAYMENT);
                log.setActionDescription(description);
                log.setStatus(AuditLog.ActionStatus.valueOf(status));
                auditLogRepository.save(log);
            }
        } catch (Exception e) {
            System.err.println("Failed to log audit event: " + e.getMessage());
        }
    }
}
