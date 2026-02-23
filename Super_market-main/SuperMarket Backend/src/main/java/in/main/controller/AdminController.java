 package in.main.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.Order;
import in.main.entities.PaymentTransaction;
import in.main.entities.PlanType;
import in.main.entities.Subscription;
import in.main.entities.SubscriptionPlan;
import in.main.entities.Ticket;
import in.main.entities.TicketMessage;
import in.main.entities.User;
import in.main.repository.OrderRepository;
import in.main.repository.PaymentTransactionRepository;
import in.main.repository.SubscriptionPlanRepository;
import in.main.repository.SubscriptionRepository;
import in.main.repository.TicketRepository;
import in.main.repository.UserRepository;
import in.main.security.JwtUtil;
import in.main.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082"}, allowCredentials = "true")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private in.main.repository.TicketMessageRepository ticketMessageRepository;

    // Admin Login with BCrypt password verification
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email/Phone and password are required"));
            }

            // Support login by email or phone
            Optional<User> userOptional = userRepository.findByEmailOrPhone(email, email);
            if (userOptional.isEmpty()) {
                logger.warn("Admin login failed: User not found for email: {}", email);
                // Log failed admin login
                auditLogService.logFailure(
                    0L,
                    email,
                    "ADMIN",
                    ActionType.LOGIN,
                    EntityType.ADMIN,
                    "Admin login attempt with email: " + email,
                    "User not found"
                );
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            User user = userOptional.get();

            // Check if user is admin or super admin
            if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.SUPER_ADMIN) {
                // Log unauthorized access attempt
                auditLogService.logFailure(
                    user.getId(),
                    user.getFullName(),
                    user.getRole().name(),
                    ActionType.LOGIN,
                    EntityType.ADMIN,
                    "Non-admin user attempted admin login",
                    "Access denied - insufficient privileges"
                );
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            // Check account status (admins can still login if frozen to fix issues)
            if (user.getAccountStatus() == User.AccountStatus.DEACTIVATED) {
                // Log deactivated admin login attempt
                auditLogService.logFailure(
                    user.getId(),
                    user.getFullName(),
                    user.getRole().name(),
                    ActionType.LOGIN,
                    EntityType.ADMIN,
                    "Deactivated admin attempted login",
                    "Account deactivated"
                );
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Account has been deactivated. Contact super administrator."));
            }

            // Verify password with BCrypt (supports both plain and hashed passwords for migration)
            boolean passwordMatches = false;
            if (user.getPasswordHash().startsWith("$2a$") || user.getPasswordHash().startsWith("$2b$")) {
                // Already hashed password - use BCrypt verification
                passwordMatches = passwordEncoder.matches(password, user.getPasswordHash());
            } else {
                // Plain text password (for migration) - direct comparison
                passwordMatches = user.getPasswordHash().equals(password);
                
                // Auto-hash the password for future logins
                if (passwordMatches) {
                    user.setPasswordHash(passwordEncoder.encode(password));
                    userRepository.save(user);
                }
            }

            if (!passwordMatches) {
                logger.warn("Admin login failed: Password mismatch for user: {}", email);
                // Log failed password attempt
                auditLogService.logFailure(
                    user.getId(),
                    user.getFullName(),
                    user.getRole().name(),
                    ActionType.LOGIN,
                    EntityType.ADMIN,
                    "Admin login attempt with incorrect password",
                    "Invalid credentials"
                );
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            
            // Log successful admin login
            auditLogService.log(
                user.getId(),
                user.getFullName(),
                user.getRole().name(),
                ActionType.LOGIN,
                EntityType.ADMIN,
                "Admin logged in successfully",
                request
            );

            // Generate JWT token for admin
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "role", user.getRole().name(),
                    "token", token
            ));
        } catch (Exception e) {
            logger.error("Error during admin login", e);
            // Return a consistent 'message' field so frontend can display this to users
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed. Please try again later."));
        }
    }

    // Get Dashboard Statistics
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long totalSubscriptions = subscriptionRepository.count();
            long activeSubscriptions = subscriptionRepository.findAll().stream()
                    .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.ACTIVE ||
                            sub.getStatus() == Subscription.SubscriptionStatus.TRIAL)
                    .count();

            List<PaymentTransaction> successfulPayments = paymentTransactionRepository.findAll().stream()
                    .filter(tx -> tx.getStatus() == PaymentTransaction.PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());

            double totalRevenue = successfulPayments.stream()
                            .filter(tx -> tx.getAmount() != null)
                            .mapToDouble(tx -> tx.getAmount().doubleValue())
                    .sum();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalSubscriptions", totalSubscriptions);
            stats.put("activeSubscriptions", activeSubscriptions);
            stats.put("totalRevenue", totalRevenue);
            stats.put("totalTransactions", successfulPayments.size());

            // Plan-wise breakdown
            Map<String, Long> planBreakdown = subscriptionRepository.findAll().stream()
                    .collect(Collectors.groupingBy(
                            sub -> sub.getPlanType().name(),
                            Collectors.counting()
                    ));
            stats.put("planBreakdown", planBreakdown);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch stats: " + e.getMessage()));
        }
    }

    // Monthly analytics for charts (revenue and subscriptions)
    @GetMapping("/analytics/monthly")
    public ResponseEntity<?> getMonthlyAnalytics() {
        try {
            List<PaymentTransaction> transactions = paymentTransactionRepository.findAll().stream()
                    .filter(tx -> tx != null && tx.getStatus() == PaymentTransaction.PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());

            List<Subscription> subs = subscriptionRepository.findAll();

            List<Map<String, Object>> months = new ArrayList<>();
            LocalDate now = LocalDate.now();

            for (int i = 11; i >= 0; i--) {
                try {
                    YearMonth ym = YearMonth.from(now).minusMonths(i);
                    LocalDateTime start = ym.atDay(1).atStartOfDay();
                    LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

                    double revenue = transactions.stream()
                            .filter(tx -> {
                                LocalDateTime d = tx.getTransactionDate();
                                return d != null && !d.isBefore(start) && !d.isAfter(end);
                            })
                            .mapToDouble(tx -> tx.getAmount().doubleValue())
                            .sum();

                    long newSubs = subs.stream()
                            .filter(s -> s != null && s.getCreatedAt() != null && !s.getCreatedAt().isBefore(start) && !s.getCreatedAt().isAfter(end))
                            .count();

                    Map<String, Object> m = new HashMap<>();
                    m.put("month", ym.getMonth().toString().substring(0, 3));
                    m.put("revenue", revenue);
                    m.put("newSubscriptions", newSubs);
                    months.add(m);
                } catch (Exception inner) {
                    logger.warn("Skipping month calculation for offset {} due to: {}", i, inner.getMessage());
                    // add placeholder month entry so months length stays consistent
                    Map<String, Object> m = new HashMap<>();
                    YearMonth ym = YearMonth.from(now).minusMonths(i);
                    m.put("month", ym.getMonth().toString().substring(0, 3));
                    m.put("revenue", 0);
                    m.put("newSubscriptions", 0);
                    months.add(m);
                }
            }

            double totalRevenue12 = months.stream().mapToDouble(m -> ((Number) m.get("revenue")).doubleValue()).sum();
            double mrr = totalRevenue12 / 12.0;

            long churnCountLast30 = subscriptionRepository.findAll().stream()
                    .filter(s -> s != null && s.getStatus() == Subscription.SubscriptionStatus.CANCELLED)
                    .filter(s -> s.getUpdatedAt() != null && s.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                    .count();

            long activeCount = subscriptionRepository.findAll().stream()
                    .filter(s -> s != null && s.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                    .count();

            double churnRate = 0.0;
            if ((activeCount + churnCountLast30) > 0) {
                churnRate = (churnCountLast30 * 100.0d) / (double) (activeCount + churnCountLast30);
            }

            long totalUsers = userRepository.count();
            double arpu = totalUsers > 0 ? (totalRevenue12 / (double) totalUsers) : 0.0;

            Map<String, Object> resp = new HashMap<>();
            resp.put("months", months);
            resp.put("mrr", mrr);
            resp.put("churnRate", Math.round(churnRate * 10) / 10.0);
            resp.put("arpu", Math.round(arpu));
            resp.put("clv", Math.round(arpu * 7));
            resp.put("nps", 42);

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Failed to fetch monthly analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch monthly analytics: " + e.getMessage()));
        }
    }

    // Get All Users (legacy) - returns full list
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("phone", user.getPhone());
                userMap.put("shopName", user.getShopName());
                userMap.put("role", user.getRole() != null ? user.getRole().name() : "USER");
                userMap.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
                userMap.put("freezeReason", user.getFreezeReason());
                userMap.put("frozenAt", user.getFrozenAt());

                // Add subscription info
                Subscription sub = subscriptionRepository.findByUser_Id(user.getId()).orElse(null);
                if (sub != null) {
                    userMap.put("planType", sub.getPlanType() != null ? sub.getPlanType().name() : "NONE");
                    userMap.put("subscriptionStatus", sub.getStatus() != null ? sub.getStatus().name() : "NONE");
                    userMap.put("subscriptionEndDate", sub.getEndDate());
                } else {
                    userMap.put("planType", "NONE");
                    userMap.put("subscriptionStatus", "NONE");
                }

                return userMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            logger.error("Failed to fetch users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }

    // New: Get counts by role for quick diagnostics
    @GetMapping("/user-role-counts")
    public ResponseEntity<?> getUserRoleCounts() {
        try {
            List<User> users = userRepository.findAll();
            Map<String, Long> counts = users.stream().collect(Collectors.groupingBy(u -> (u.getRole() != null ? u.getRole().name() : "USER"), Collectors.counting()));
            Map<String, Object> resp = new HashMap<>();
            resp.put("total", users.size());
            resp.put("roleCounts", counts);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Failed to fetch user role counts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch role counts: " + e.getMessage()));
        }
    }

    // Search users with paging and filters
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String professionalNumber,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // If searching by professional number, return single user
            if (professionalNumber != null && !professionalNumber.isBlank()) {
                Optional<User> userOpt = userRepository.findByProfessionalNumber(professionalNumber.trim());
                if (!userOpt.isPresent()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "User not found with professional number: " + professionalNumber));
                }
                
                User user = userOpt.get();
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("phoneNumber", user.getPhone());
                userMap.put("shopName", user.getShopName());
                userMap.put("shopAddress", user.getShopAddress());
                userMap.put("professionalNumber", user.getProfessionalNumber());
                userMap.put("role", user.getRole().name());
                userMap.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
                userMap.put("freezeReason", user.getFreezeReason());
                userMap.put("frozenAt", user.getFrozenAt());

                Subscription sub = subscriptionRepository.findByUser_Id(user.getId()).orElse(null);
                if (sub != null) {
                    userMap.put("subscriptionPlan", sub.getPlanType().name());
                    userMap.put("subscriptionActive", sub.getStatus().name().equals("ACTIVE"));
                    userMap.put("subscriptionEndDate", sub.getEndDate());
                } else {
                    userMap.put("subscriptionPlan", null);
                    userMap.put("subscriptionActive", false);
                }
                
                return ResponseEntity.ok(userMap);
            }
            
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            org.springframework.data.domain.Page<User> result;

            if (q == null || q.isBlank()) {
                result = userRepository.findAll(pageable);
            } else {
                result = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
            }

            // Map to response objects
            List<Map<String, Object>> userList = result.getContent().stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("phone", user.getPhone());
                userMap.put("shopName", user.getShopName());
                userMap.put("professionalNumber", user.getProfessionalNumber());
                userMap.put("role", user.getRole().name());
                userMap.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
                userMap.put("freezeReason", user.getFreezeReason());
                userMap.put("frozenAt", user.getFrozenAt());

                Subscription sub = subscriptionRepository.findByUser_Id(user.getId()).orElse(null);
                if (sub != null) {
                    userMap.put("planType", sub.getPlanType().name());
                    userMap.put("subscriptionStatus", sub.getStatus().name());
                    userMap.put("subscriptionEndDate", sub.getEndDate());
                } else {
                    userMap.put("planType", "NONE");
                    userMap.put("subscriptionStatus", "NONE");
                }
                return userMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("users", userList);
            response.put("totalPages", result.getTotalPages());
            response.put("totalElements", result.getTotalElements());
            response.put("currentPage", result.getNumber());
            response.put("pageSize", result.getSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search users: " + e.getMessage()));
        }
    }

    // Export users for CSV
    @GetMapping("/users/export")
    public ResponseEntity<?> exportUsers(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10000") int size) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            org.springframework.data.domain.Page<User> result;
            if (q == null || q.isBlank()) {
                result = userRepository.findAll(pageable);
            } else {
                result = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
            }

            List<Map<String, Object>> userList = result.getContent().stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("phone", user.getPhone());
                userMap.put("shopName", user.getShopName());
                userMap.put("role", user.getRole().name());
                userMap.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
                userMap.put("freezeReason", user.getFreezeReason());
                userMap.put("frozenAt", user.getFrozenAt());
                return userMap;
            }).collect(Collectors.toList());

            Map<String, Object> exportData = new HashMap<>();
            exportData.put("users", userList);
            exportData.put("totalRecords", result.getTotalElements());
            exportData.put("exportDate", java.time.LocalDateTime.now());

            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to export users: " + e.getMessage()));
        }
    }

    // Get All Subscriptions
    @GetMapping("/subscriptions")
    public ResponseEntity<?> getAllSubscriptions() {
        try {
            List<Subscription> subscriptions = subscriptionRepository.findAll();
            List<Map<String, Object>> subList = subscriptions.stream().map(sub -> {
                Map<String, Object> subMap = new HashMap<>();
                subMap.put("id", sub.getId());
                subMap.put("userId", sub.getUser().getId());
                subMap.put("userEmail", sub.getUser().getEmail());
                subMap.put("userName", sub.getUser().getFullName());
                subMap.put("planType", sub.getPlanType().name());
                subMap.put("status", sub.getStatus().name());
                subMap.put("startDate", sub.getStartDate());
                subMap.put("endDate", sub.getEndDate());
                subMap.put("amountPaid", sub.getAmountPaid());
                subMap.put("isTrialActive", sub.isTrialActive());
                subMap.put("autoRenew", sub.isAutoRenew());
                return subMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(subList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch subscriptions: " + e.getMessage()));
        }
    }

    // Get All Payment Transactions
    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions() {
        try {
            List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
            List<Map<String, Object>> txList = transactions.stream().map(tx -> {
                Map<String, Object> txMap = new HashMap<>();
                txMap.put("id", tx.getId());
                txMap.put("userId", tx.getUser().getId());
                txMap.put("userEmail", tx.getUser().getEmail());
                txMap.put("userName", tx.getUser().getFullName());
                txMap.put("amount", tx.getAmount());
                txMap.put("currency", tx.getCurrency());
                txMap.put("status", tx.getStatus().name());
                txMap.put("paymentMethod", tx.getMethod() != null ? tx.getMethod().name() : "N/A");
                txMap.put("razorpayPaymentId", tx.getRazorpayPaymentId());
                txMap.put("acuratoPaymentId", tx.getAcuratoPaymentId());
                txMap.put("acuratoOrderId", tx.getAcuratoOrderId());
                txMap.put("transactionDate", tx.getTransactionDate());
                txMap.put("description", tx.getDescription());
                return txMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(txList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch transactions: " + e.getMessage()));
        }
    }

    // Update User Role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String roleStr = request.get("role");
            String oldRole = user.getRole().name();
            User.Role newRole = User.Role.valueOf(roleStr);
            user.setRole(newRole);
            userRepository.save(user);

            // Audit log
            try {
                auditLogService.log(
                    userId, user.getFullName(), newRole.name(),
                    ActionType.USER_UPDATE, EntityType.USER, userId,
                    "User role changed: " + oldRole + " → " + newRole.name() + " for user: " + user.getFullName()
                );
            } catch (Exception ignored) {}

            return ResponseEntity.ok(Map.of("message", "User role updated successfully", "role", newRole.name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update role: " + e.getMessage()));
        }
    }

    // Cancel Subscription
    @PutMapping("/subscriptions/{subscriptionId}/cancel")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long subscriptionId) {
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));

            subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            subscription.setAutoRenew(false);
            subscriptionRepository.save(subscription);

            // Audit log
            try {
                User user = subscription.getUser();
                auditLogService.log(
                    user != null ? user.getId() : null,
                    user != null ? user.getFullName() : "Admin",
                    "ADMIN",
                    ActionType.SUBSCRIPTION_CANCEL, EntityType.SUBSCRIPTION, subscriptionId,
                    "Subscription cancelled by admin for subscription ID: " + subscriptionId
                );
            } catch (Exception ignored) {}

            return ResponseEntity.ok(Map.of("message", "Subscription cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel subscription: " + e.getMessage()));
        }
    }

    // Activate Subscription
    @PutMapping("/subscriptions/{subscriptionId}/activate")
    public ResponseEntity<?> activateSubscription(@PathVariable Long subscriptionId) {
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));

            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscriptionRepository.save(subscription);

            // Audit log
            try {
                User user = subscription.getUser();
                auditLogService.log(
                    user != null ? user.getId() : null,
                    user != null ? user.getFullName() : "Admin",
                    "ADMIN",
                    ActionType.SUBSCRIPTION_UPDATE, EntityType.SUBSCRIPTION, subscriptionId,
                    "Subscription activated by admin for subscription ID: " + subscriptionId
                );
            } catch (Exception ignored) {}

            return ResponseEntity.ok(Map.of("message", "Subscription activated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to activate subscription: " + e.getMessage()));
        }
    }

    // Delete User
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, @RequestParam Long adminId) {
        try {
            User userToDelete = userRepository.findById(userId).orElse(null);
            User admin = userRepository.findById(adminId).orElse(null);
            
            userRepository.deleteById(userId);
            
            // Log user deletion
            if (admin != null && userToDelete != null) {
                auditLogService.log(
                    admin.getId(),
                    admin.getFullName(),
                    admin.getRole().name(),
                    ActionType.USER_DELETE,
                    EntityType.USER,
                    userId,
                    "Deleted user: " + userToDelete.getFullName() + " (" + userToDelete.getEmail() + ")"
                );
            }
            
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // Freeze User Account
    @PutMapping("/users/{userId}/freeze")
    public ResponseEntity<?> freezeAccount(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String reason = request.getOrDefault("reason", "Account frozen by administrator").toString();
            Long adminId = request.containsKey("adminId") ? Long.parseLong(request.get("adminId").toString()) : null;

            user.setAccountStatus(User.AccountStatus.FROZEN);
            user.setFreezeReason(reason);
            user.setFrozenAt(java.time.LocalDateTime.now());
            user.setFrozenBy(adminId);
            userRepository.save(user);
            
            // Log account freeze
            if (adminId != null) {
                User admin = userRepository.findById(adminId).orElse(null);
                if (admin != null) {
                    auditLogService.log(
                        admin.getId(),
                        admin.getFullName(),
                        admin.getRole().name(),
                        ActionType.ACCOUNT_FREEZE,
                        EntityType.USER,
                        userId,
                        "Froze account: " + user.getFullName() + ". Reason: " + reason
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Account frozen successfully",
                    "userId", userId,
                    "status", "FROZEN",
                    "reason", reason
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to freeze account: " + e.getMessage()));
        }
    }

    // Unfreeze User Account
    @PutMapping("/users/{userId}/unfreeze")
    public ResponseEntity<?> unfreezeAccount(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long adminId = request.containsKey("adminId") ? Long.parseLong(request.get("adminId").toString()) : null;

            user.setAccountStatus(User.AccountStatus.ACTIVE);
            user.setFreezeReason(null);
            user.setFrozenAt(null);
            user.setFrozenBy(null);
            userRepository.save(user);
            
            // Log account unfreeze
            if (adminId != null) {
                User admin = userRepository.findById(adminId).orElse(null);
                if (admin != null) {
                    auditLogService.log(
                        admin.getId(),
                        admin.getFullName(),
                        admin.getRole().name(),
                        ActionType.ACCOUNT_UNFREEZE,
                        EntityType.USER,
                        userId,
                        "Unfroze account: " + user.getFullName()
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Account unfrozen successfully",
                    "userId", userId,
                    "status", "ACTIVE"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unfreeze account: " + e.getMessage()));
        }
    }

    // Suspend User Account
    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<?> suspendAccount(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String reason = request.getOrDefault("reason", "Account suspended by administrator").toString();
            Long adminId = request.containsKey("adminId") ? Long.parseLong(request.get("adminId").toString()) : null;

            user.setAccountStatus(User.AccountStatus.SUSPENDED);
            user.setFreezeReason(reason);
            user.setFrozenAt(java.time.LocalDateTime.now());
            user.setFrozenBy(adminId);
            userRepository.save(user);
            
            // Log account suspension
            if (adminId != null) {
                User admin = userRepository.findById(adminId).orElse(null);
                if (admin != null) {
                    auditLogService.log(
                        admin.getId(),
                        admin.getFullName(),
                        admin.getRole().name(),
                        ActionType.ACCOUNT_SUSPEND,
                        EntityType.USER,
                        userId,
                        "Suspended account: " + user.getFullName() + ". Reason: " + reason
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Account suspended successfully",
                    "userId", userId,
                    "status", "SUSPENDED",
                    "reason", reason
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to suspend account: " + e.getMessage()));
        }
    }

    // Get Account Status
    @GetMapping("/users/{userId}/status")
    public ResponseEntity<?> getAccountStatus(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> status = new HashMap<>();
            status.put("userId", userId);
            status.put("email", user.getEmail());
            status.put("fullName", user.getFullName());
            status.put("accountStatus", user.getAccountStatus().name());
            status.put("freezeReason", user.getFreezeReason());
            status.put("frozenAt", user.getFrozenAt() != null ? user.getFrozenAt().toString() : null);
            status.put("frozenBy", user.getFrozenBy());

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get account status: " + e.getMessage()));
        }
    }
    
    // Update Professional Number
    @PutMapping("/users/{userId}/professional-number")
    public ResponseEntity<?> updateProfessionalNumber(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newNumber = request.get("professionalNumber").toString();
            Long adminId = request.containsKey("adminId") ? Long.parseLong(request.get("adminId").toString()) : null;

            // Check if professional number already exists for another user
            Optional<User> existingUser = userRepository.findByProfessionalNumber(newNumber);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Professional number already assigned to another user"));
            }

            String oldNumber = user.getProfessionalNumber();
            user.setProfessionalNumber(newNumber);
            userRepository.save(user);

            // Log professional number update
            if (adminId != null) {
                User admin = userRepository.findById(adminId).orElse(null);
                if (admin != null) {
                    auditLogService.log(
                        admin.getId(),
                        admin.getFullName(),
                        admin.getRole().name(),
                        ActionType.USER_UPDATE,
                        EntityType.USER,
                        userId,
                        "Updated professional number for " + user.getFullName() + " from " + oldNumber + " to " + newNumber
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Professional number updated successfully",
                    "userId", userId,
                    "professionalNumber", newNumber
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update professional number: " + e.getMessage()));
        }
    }

    // Get All Subscription Plans (Admin)
    @GetMapping("/subscription-plans")
    public ResponseEntity<?> getAllSubscriptionPlans() {
        try {
            List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
            List<Map<String, Object>> planList = plans.stream().map(plan -> {
                Map<String, Object> planMap = new HashMap<>();
                planMap.put("id", plan.getId());
                planMap.put("planName", plan.getPlanName());
                planMap.put("price", plan.getPrice());
                planMap.put("durationDays", plan.getDurationDays());
                planMap.put("description", plan.getDescription());
                planMap.put("maxProducts", plan.getMaxProducts());
                planMap.put("maxUsers", plan.getMaxUsers());
                planMap.put("isActive", plan.getIsActive());
                planMap.put("isPopular", plan.getIsPopular());
                planMap.put("iconColor", plan.getIconColor());
                return planMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(planList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch subscription plans: " + e.getMessage()));
        }
    }

    // Create Subscription Plan (Admin)
    @PostMapping("/subscription-plans")
    public ResponseEntity<?> createSubscriptionPlan(@RequestBody Map<String, Object> request, @RequestHeader(value = "userId", required = false) String adminIdHeader) {
        try {
            SubscriptionPlan plan = new SubscriptionPlan();
            
            // Required fields
            if (request.containsKey("planName")) {
                plan.setPlanName(request.get("planName").toString());
            }
            if (request.containsKey("planType")) {
                plan.setPlanType(PlanType.valueOf(request.get("planType").toString().toUpperCase()));
            }
            if (request.containsKey("price")) {
                plan.setPrice(Double.parseDouble(request.get("price").toString()));
            }
            if (request.containsKey("durationDays")) {
                plan.setDurationDays(Integer.parseInt(request.get("durationDays").toString()));
            }
            if (request.containsKey("maxProducts")) {
                plan.setMaxProducts(Integer.parseInt(request.get("maxProducts").toString()));
            }
            if (request.containsKey("maxUsers")) {
                plan.setMaxUsers(Integer.parseInt(request.get("maxUsers").toString()));
            }
            
            // Optional fields
            if (request.containsKey("description")) {
                plan.setDescription(request.get("description").toString());
            }
            if (request.containsKey("isActive")) {
                plan.setIsActive(Boolean.parseBoolean(request.get("isActive").toString()));
            }
            if (request.containsKey("isPopular")) {
                plan.setIsPopular(Boolean.parseBoolean(request.get("isPopular").toString()));
            }
            if (request.containsKey("iconColor")) {
                plan.setIconColor(request.get("iconColor").toString());
            }
            if (request.containsKey("features") && request.get("features") instanceof List) {
                plan.setFeatures((List<String>) request.get("features"));
            }
            
            // Set created by
            if (adminIdHeader != null) {
                try {
                    plan.setCreatedBy(Long.parseLong(adminIdHeader));
                } catch (NumberFormatException ignored) {}
            }
            
            SubscriptionPlan savedPlan = subscriptionPlanRepository.save(plan);
            
            // Log the creation
            if (adminIdHeader != null) {
                try {
                    Long adminId = Long.parseLong(adminIdHeader);
                    User admin = userRepository.findById(adminId).orElse(null);
                    if (admin != null) {
                        auditLogService.log(
                            admin.getId(),
                            admin.getFullName(),
                            admin.getRole().name(),
                            ActionType.PLAN_CREATE,
                            EntityType.SUBSCRIPTION_PLAN,
                            savedPlan.getId(),
                            "Created subscription plan: " + savedPlan.getPlanName()
                        );
                    }
                } catch (Exception ignored) {}
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Subscription plan created successfully",
                "plan", savedPlan
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create subscription plan: " + e.getMessage()));
        }
    }

    // Update Subscription Plan
    @PutMapping("/subscription-plans/{planId}")
    public ResponseEntity<?> updateSubscriptionPlan(@PathVariable Long planId, @RequestBody Map<String, Object> request) {
        try {
            SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

            if (request.containsKey("price")) {
                plan.setPrice(Double.parseDouble(request.get("price").toString()));
            }
            if (request.containsKey("maxProducts")) {
                plan.setMaxProducts(Integer.parseInt(request.get("maxProducts").toString()));
            }

            subscriptionPlanRepository.save(plan);

            return ResponseEntity.ok(Map.of("message", "Subscription plan updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update subscription plan: " + e.getMessage()));
        }
    }

    // Get All Orders (Admin)
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            List<Map<String, Object>> orderList = orders.stream().map(order -> {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("user", order.getUser() != null ? Map.of(
                    "id", order.getUser().getId(),
                    "fullName", order.getUser().getFullName()
                ) : null);
                orderMap.put("items", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
                orderMap.put("total", order.getTotal());
                orderMap.put("date", order.getDate());
                return orderMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(orderList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    // Get All Audit Logs (Admin)
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            List<in.main.entities.AuditLog> auditLogs = auditLogService.getAllAuditLogs();
            List<Map<String, Object>> logList = auditLogs.stream().map(log -> {
                Map<String, Object> logMap = new HashMap<>();
                try {
                    logMap.put("id", log.getId());
                    logMap.put("timestamp", log.getTimestamp());
                    logMap.put("userName", log.getUserName());
                    logMap.put("actionType", log.getActionType() != null ? log.getActionType().name() : null);
                    logMap.put("entityType", log.getEntityType() != null ? log.getEntityType().name() : null);
                    logMap.put("status", log.getStatus() != null ? log.getStatus().name() : null);
                } catch (Exception inner) {
                    // If any single log mapping fails, don't fail the whole endpoint. Log and include minimal info.
                    logger.warn("Failed to map audit log id {}: {}", log != null ? log.getId() : "null", inner.getMessage());
                    logMap.put("id", log != null ? log.getId() : null);
                    logMap.put("mappingError", inner.getMessage());
                }
                return logMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(logList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    // Get All Tickets (Admin)
    @GetMapping("/tickets")
    public ResponseEntity<?> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            org.springframework.data.domain.Page<Ticket> ticketsPage = ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc(pageable);
            List<Ticket> tickets = ticketsPage.getContent();

            List<Long> ids = tickets.stream().map(Ticket::getId).collect(Collectors.toList());

            // Batch fetch message counts
            Map<Long, Long> msgCounts = new HashMap<>();
            if (!ids.isEmpty()) {
                List<Object[]> counts = ticketMessageRepository.countMessagesByTicketIds(ids);
                for (Object[] row : counts) {
                    Long tId = (Long) row[0];
                    Long c = (Long) row[1];
                    msgCounts.put(tId, c);
                }
            }

            // Batch fetch last messages
            Map<Long, TicketMessage> lastMap = new HashMap<>();
            if (!ids.isEmpty()) {
                List<TicketMessage> lasts = ticketMessageRepository.findLastMessagesForTicketIds(ids);
                for (TicketMessage m : lasts) {
                    lastMap.put(m.getTicket().getId(), m);
                }
            }

            List<Map<String, Object>> ticketList = new ArrayList<>();
            for (Ticket ticket : tickets) {
                try {
                    Map<String, Object> ticketMap = new HashMap<>();
                    ticketMap.put("id", ticket.getId());
                    ticketMap.put("ticketNumber", ticket.getTicketNumber());
                    ticketMap.put("subject", ticket.getSubject());

                    if (ticket.getUserId() != null) {
                        Optional<User> u = userRepository.findById(ticket.getUserId());
                        String name = u.map(User::getFullName).orElse("Unknown");
                        ticketMap.put("user", Map.of(
                                "id", ticket.getUserId(),
                                "fullName", name,
                                "email", u.isPresent() ? u.get().getEmail() : null
                        ));
                    } else {
                        ticketMap.put("user", null);
                    }

                    ticketMap.put("priority", ticket.getPriority() != null ? ticket.getPriority().name() : null);
                    ticketMap.put("status", ticket.getStatus() != null ? ticket.getStatus().name() : null);
                    ticketMap.put("createdAt", ticket.getCreatedAt());

                    ticketMap.put("messageCount", msgCounts.getOrDefault(ticket.getId(), 0L));
                    if (lastMap.containsKey(ticket.getId())) {
                        TicketMessage last = lastMap.get(ticket.getId());
                        Map<String,Object> lm = new HashMap<>();
                        lm.put("sender", last.getSender().name());
                        lm.put("message", last.getMessage());
                        lm.put("createdAt", last.getCreatedAt());
                        ticketMap.put("lastMessage", lm);
                    }

                    ticketList.add(ticketMap);
                } catch (Exception inner) {
                    logger.warn("Skipped ticket id {} due to mapping error: {}", ticket != null ? ticket.getId() : "null", inner.getMessage());
                    Map<String, Object> failed = new HashMap<>();
                    failed.put("id", ticket != null ? ticket.getId() : null);
                    failed.put("error", "Failed to map ticket");
                    ticketList.add(failed);
                }
            }

            Map<String,Object> result = new HashMap<>();
            result.put("items", ticketList);
            result.put("page", ticketsPage.getNumber());
            result.put("size", ticketsPage.getSize());
            result.put("totalElements", ticketsPage.getTotalElements());
            result.put("totalPages", ticketsPage.getTotalPages());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to fetch tickets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tickets: " + e.getMessage()));
        }
    }
}


