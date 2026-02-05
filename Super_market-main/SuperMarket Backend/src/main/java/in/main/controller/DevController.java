package in.main.controller;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.AuditLogService;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;

@RestController
@RequestMapping("/api/dev")
@Profile("local")
public class DevController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.ok(Map.of("message", "admin already exists"));
        }
        User admin = new User();
        admin.setFullName("Dev Admin");
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(User.Role.SUPER_ADMIN);
        admin.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(admin);
        return ResponseEntity.ok(Map.of("message", "admin created", "email", email));
    }

    // Dev helper to create a regular user for testing
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String fullName = body.getOrDefault("fullName", "Test User");
        String password = body.getOrDefault("password", "password123");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email required"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.ok(Map.of("message", "user already exists"));
        }
        User u = new User();
        u.setFullName(fullName);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setRole(User.Role.USER);
        u.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "user created", "email", email));
    }

    // Dev helper to seed multiple users and audit logs in one request
    @PostMapping("/seed")
    public ResponseEntity<?> seedTestData(@RequestBody(required = false) Map<String, Object> body) {
        int usersToCreate = 5;
        if (body != null && body.containsKey("users")) {
            try { usersToCreate = Integer.parseInt(body.get("users").toString()); } catch (Exception e) { }
        }

        List<Map<String, Object>> created = new ArrayList<>();

        for (int i = 1; i <= usersToCreate; i++) {
            String email = String.format("dev.user.%d@example.com", i);
            if (userRepository.findByEmail(email).isPresent()) {
                created.add(Map.of("email", email, "status", "exists"));
                continue;
            }
            User u = new User();
            u.setFullName("Dev User " + i);
            u.setEmail(email);
            u.setPasswordHash(passwordEncoder.encode("password"));
            u.setRole(User.Role.USER);
            u.setAccountStatus(User.AccountStatus.ACTIVE);
            userRepository.save(u);
            // Create an audit log for user creation
            try {
                auditLogService.log(u.getId(), u.getFullName(), u.getRole().name(), ActionType.USER_CREATE, EntityType.USER, "Created dev test user");
            } catch (Exception e) {
                // ignore logging errors in seed
            }
            created.add(Map.of("email", email, "status", "created"));
        }

        return ResponseEntity.ok(Map.of("created", created));
    }
}
