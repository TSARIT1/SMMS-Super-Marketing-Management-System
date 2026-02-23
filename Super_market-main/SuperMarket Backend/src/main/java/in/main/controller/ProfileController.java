package in.main.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import in.main.dto.ProfileRequest;
import in.main.dto.ProfileResponse;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.AuditLogService;
import in.main.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082", "https://smms.tsaritservices.com"}, allowCredentials = "true")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ================= UPDATE PROFILE =================
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> updateProfile(
            @ModelAttribute ProfileRequest request,
            @RequestParam(value = "profile_photo", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "qr_code", required = false) MultipartFile qrCode,
            HttpServletRequest httpRequest,
            Authentication authentication
    ) {
        try {
            System.out.println("🔥 UPDATE PROFILE API HIT");
            System.out.println("📸 Profile Photo received: " + (profilePhoto != null ? "YES" : "NO"));
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                System.out.println("📸 Profile Photo filename: " + profilePhoto.getOriginalFilename());
                System.out.println("📸 Profile Photo size: " + profilePhoto.getSize() + " bytes");
                System.out.println("📸 Profile Photo content type: " + profilePhoto.getContentType());
            }
            System.out.println("📸 QR Code received: " + (qrCode != null ? "YES" : "NO"));
            User user = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                Long userId = null;
                if (principal instanceof Number numberPrincipal) {
                    userId = numberPrincipal.longValue();
                } else {
                    try {
                        userId = Long.valueOf(principal.toString());
                    } catch (NumberFormatException ignored) {
                    }
                }
                if (userId != null) {
                    user = userRepository.findById(userId).orElse(null);
                }
            }

            String resolvedAccountEmail = request.getAccount_email();
            if (resolvedAccountEmail == null || resolvedAccountEmail.isBlank()) {
                resolvedAccountEmail = request.getEmail();
            }

            if (user == null && (resolvedAccountEmail == null || resolvedAccountEmail.isBlank())) {
                System.err.println("❌ Email is null or blank");
                return ResponseEntity.badRequest().body(null);
            }
            if (user == null) {
                final String accountEmail = resolvedAccountEmail;
                user = userRepository.findByEmail(accountEmail)
                        .orElseGet(() -> {
                            System.out.println("ℹ️ Creating new user for email: " + accountEmail);
                            User newUser = new User();
                            newUser.setEmail(accountEmail);
                            newUser.setShopName(request.getShop_name());
                            return userRepository.save(newUser);
                        });
            }

            ProfileResponse response = profileService.updateProfile(user, request, profilePhoto, qrCode);

            // Build audit description with what changed
            StringBuilder changes = new StringBuilder("Updated profile");
            if (request.getShop_name() != null) changes.append(" | Shop: ").append(request.getShop_name());
            if (request.getAccepted_payment_methods() != null) changes.append(" | Payment methods: ").append(request.getAccepted_payment_methods());
            if (request.getProduct_categories() != null) changes.append(" | Categories: ").append(request.getProduct_categories());
            if (profilePhoto != null && !profilePhoto.isEmpty()) changes.append(" | Updated profile photo");
            if (qrCode != null && !qrCode.isEmpty()) changes.append(" | Updated QR code");

            auditLogService.log(
                user.getId(), user.getFullName() != null ? user.getFullName() : user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "USER",
                ActionType.USER_UPDATE, EntityType.USER,
                changes.toString(), httpRequest
            );

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR updating profile: " + e.getMessage());
            try {
                String accountEmail = request.getAccount_email();
                if (accountEmail == null || accountEmail.isBlank()) {
                    accountEmail = request.getEmail();
                }
                User user = accountEmail == null ? null : userRepository.findByEmail(accountEmail).orElse(null);
                if (user != null) {
                    auditLogService.logFailure(
                        user.getId(), user.getFullName(), user.getRole().name(),
                        ActionType.USER_UPDATE, EntityType.USER,
                        "Failed to update profile: " + e.getMessage(), e.getMessage()
                    );
                }
            } catch (Exception ignored) {}
            return ResponseEntity.status(500).body(null);
        }
    }

    // ================= GET PROFILE =================
    @GetMapping
    public ResponseEntity<?> getProfile(@RequestParam String email) {

        System.out.println("🔥 FETCH PROFILE FOR: " + email);
        try {
            ProfileResponse response = profileService.getProfile(email);
            System.out.println("🔥 PROFILE RESPONSE: " + response);
            return ResponseEntity.ok(response);
        } catch (RuntimeException re) {
            // If user or profile not found, return 200 with null body so frontend gracefully handles empty profiles
            System.err.println("❌ PROFILE NOT FOUND: " + re.getMessage());
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            System.err.println("❌ PROFILE ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }


}
