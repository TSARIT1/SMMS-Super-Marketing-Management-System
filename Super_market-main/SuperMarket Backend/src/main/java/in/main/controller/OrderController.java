package in.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.dto.OrderRequest;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.Order;
import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.AuditLogService;
import in.main.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082", "https://smms.tsaritservices.com"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService service;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
    public Order placeOrder(
            @RequestParam(required = false) Long userId,
            @RequestBody OrderRequest request,
            HttpServletRequest httpRequest
    ) {
        Long uid = userId;
        if (uid == null) {
            try {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    Object principal = auth.getPrincipal();
                    if (principal instanceof Long) uid = (Long) principal;
                    if (principal instanceof String) uid = Long.valueOf((String) principal);
                }
            } catch (Exception ignored) {}
        }
        if (uid == null) throw new RuntimeException("Missing userId");

        User user = userRepo.findById(uid)
            .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Order order = service.placeOrder(request, user);
            auditLogService.log(
                user.getId(), user.getFullName(), user.getRole().name(),
                ActionType.ORDER_CREATE, EntityType.ORDER,
                "Created order " + order.getOrderNumber() + " | Customer: " + order.getCustomer()
                    + " | Items: " + order.getItems() + " | Total: ₹" + String.format("%.2f", order.getTotal())
                    + " | Payment: " + request.getPaymentMethod(),
                httpRequest
            );
            return order;
        } catch (Exception e) {
            auditLogService.logFailure(
                user.getId(), user.getFullName(), user.getRole().name(),
                ActionType.ORDER_CREATE, EntityType.ORDER,
                "Failed to create order for customer: " + request.getCustomerName() + " - " + e.getMessage(),
                e.getMessage()
            );
            throw e;
        }
    }

    @GetMapping
    public java.util.List<Order> listOrders(@RequestParam(required = false) Long userId, HttpServletRequest httpRequest) {
        Long uid = userId;
        if (uid == null) {
            try {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    Object principal = auth.getPrincipal();
                    if (principal instanceof Long) uid = (Long) principal;
                    if (principal instanceof String) uid = Long.valueOf((String) principal);
                }
            } catch (Exception ignored) {}
        }
        if (uid == null) throw new RuntimeException("Missing userId");
        java.util.List<Order> orders = service.getOrdersForUser(uid);
        // Log order view
        try {
            User user = userRepo.findById(uid).orElse(null);
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.ORDER_VIEW, EntityType.ORDER,
                    "Viewed order history (" + orders.size() + " orders)",
                    httpRequest
                );
            }
        } catch (Exception ignored) {}
        return orders;
    }

}

