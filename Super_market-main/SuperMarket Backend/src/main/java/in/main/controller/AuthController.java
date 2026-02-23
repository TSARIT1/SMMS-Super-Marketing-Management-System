package in.main.controller;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.dto.AuthRequests;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.User;
import in.main.security.JwtUtil;
import in.main.service.AuditLogService;
import in.main.service.SubscriptionService;
import in.main.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082" }, allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private JwtUtil jwtUtil;

    private final boolean autoFreeTrialOnRegister = true;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequests.RegisterRequest req, HttpServletRequest request) {
        try {
            User saved = userService.register(req);

            // Log registration
            logAuditBlocking(saved.getId(), saved.getFullName(), "USER", ActionType.REGISTER, EntityType.USER, 
                    "User registered successfully: " + saved.getEmail(), request);

            // Optionally start free trial automatically
            if (autoFreeTrialOnRegister) {
                try {
                    var subscription = subscriptionService.startFreeTrial(saved.getId());
                    return ResponseEntity.ok(Map.of("user", saved, "subscription", subscription));
                } catch (Exception e) {
                    logger.warn("Trial start failed for user {}: {}", saved.getId(), e.getMessage());
                    return ResponseEntity.ok(Map.of("user", saved, "warning", "Trial start failed: " + e.getMessage()));
                }
            }

            return ResponseEntity.ok(Map.of("user", saved));
        } catch (Exception e) {
            logger.error("Registration failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequests.LoginRequest req, HttpServletRequest request) {
        Optional<User> result = userService.login(req);

        if (result.isPresent()) {
            User user = result.get();

            // Check account status
            if (user.getAccountStatus() != User.AccountStatus.ACTIVE) {
                return handleBlockedAccount(user);
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

            // Log successful login
            logAuditBlocking(user.getId(), user.getFullName(), user.getRole().name(), ActionType.LOGIN, EntityType.AUTH,
                    "User logged in successfully", request);

            return ResponseEntity.ok(Map.of(
                "user", user,
                "token", token
            ));
        } else {
            // Log failed login
            auditLogService.logFailure(0L, req.getEmailOrPhone(), "UNKNOWN", ActionType.LOGIN, EntityType.AUTH,
                    "Login attempt failed", "Invalid credentials");
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody AuthRequests.ForgotPassword req) {
        userService.initiatePasswordReset(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody AuthRequests.ResetPassword req, HttpServletRequest request) {
        userService.resetPassword(req);

        // Log password reset
        logAuditBlocking(0L, "User", "USER", ActionType.PASSWORD_RESET, EntityType.AUTH, 
                "Password reset completed", request);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    // Helper methods

    private ResponseEntity<?> handleBlockedAccount(User user) {
        String status = user.getAccountStatus().name();
        String reason = user.getFreezeReason() != null ? user.getFreezeReason() : "Contact administrator";
        String message = "Your account has been " + status.toLowerCase() + ". Reason: " + reason;

        auditLogService.logFailure(user.getId(), user.getFullName(), user.getRole().name(), ActionType.LOGIN,
                EntityType.AUTH, "Login blocked - " + status, message);

        return ResponseEntity.status(403).body(Map.of("error", "Account " + status, "message", message, "status", status));
    }

    private void logAuditBlocking(Long userId, String userName, String role, ActionType action, EntityType entity, 
            String details, HttpServletRequest request) {
        try {
            auditLogService.log(userId, userName, role, action, entity, details, request);
        } catch (Exception e) {
            logger.error("Audit logging failed", e);
        }
    }
}
