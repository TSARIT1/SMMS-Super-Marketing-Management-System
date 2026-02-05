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
import in.main.entities.Order;
import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService service;

    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public Order placeOrder(
            @RequestParam(required = false) Long userId,
            @RequestBody OrderRequest request
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

        return service.placeOrder(request, user);
    }

    @GetMapping
    public java.util.List<Order> listOrders(@RequestParam(required = false) Long userId) {
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
        return service.getOrdersForUser(uid);
    }

}

