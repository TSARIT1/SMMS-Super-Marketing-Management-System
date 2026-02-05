package in.main.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    // ================= UPDATE PROFILE =================
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> updateProfile(
            @ModelAttribute ProfileRequest request,
            @RequestParam(value = "profile_photo", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "qr_code", required = false) MultipartFile qrCode
    ) {
        try {
            System.out.println("🔥 UPDATE PROFILE API HIT");
            System.out.println("Email from request = " + request.getEmail());
            System.out.println("Shop name = " + request.getShop_name());
            System.out.println("Payment methods = " + request.getAccepted_payment_methods());
            System.out.println("Categories = " + request.getProduct_categories());

            if (request.getEmail() == null || request.getEmail().isBlank()) {
                System.err.println("❌ Email is null or blank");
                return ResponseEntity.badRequest()
                        .body(null);
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseGet(() -> {
                        // Create a new user record when email not found so profile can be saved
                        System.out.println("ℹ️ Creating new user for email: " + request.getEmail());
                        User newUser = new User();
                        newUser.setEmail(request.getEmail());
                        newUser.setShopName(request.getShop_name());
                        // default role and account status are handled by User entity
                        return userRepository.save(newUser);
                    });

            System.out.println("✅ User available: " + user.getEmail());

            ProfileResponse response = profileService.updateProfile(user, request, profilePhoto, qrCode);

            System.out.println("✅ Profile updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(null);
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
