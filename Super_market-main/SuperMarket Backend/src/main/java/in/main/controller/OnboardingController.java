package in.main.controller;

import in.main.entities.Onboarding;
import in.main.entities.User;
import in.main.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOnboardingStatus(@RequestParam Long userId) {
        try {
            Onboarding onboarding = onboardingService.getOnboardingByUserId(userId);
            Map<String, Object> response = new HashMap<>();

            if (onboarding != null) {
                response.put("isCompleted", onboarding.getIsCompleted());
                response.put("isSkipped", onboarding.getIsSkipped());
                response.put("currentStep", onboarding.getCurrentStep());
                response.put("personalInfoCompleted", onboarding.getPersonalInfoCompleted());
                response.put("shopDetailsCompleted", onboarding.getShopDetailsCompleted());
                response.put("documentsUploaded", onboarding.getDocumentsUploaded());
            } else {
                response.put("isCompleted", false);
                response.put("isSkipped", false);
                response.put("currentStep", 1);
                response.put("personalInfoCompleted", false);
                response.put("shopDetailsCompleted", false);
                response.put("documentsUploaded", false);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get onboarding status"));
        }
    }

    @PostMapping("/update-progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @RequestParam Long userId,
            @RequestParam int step,
            @RequestBody Map<String, Object> data) {
        try {
            // For now, we'll need to get the user from the userId
            // In a real implementation, you'd get this from security context
            User user = new User();
            user.setId(userId);

            Onboarding onboarding = onboardingService.updateOnboardingProgress(user, step, data);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "currentStep", onboarding.getCurrentStep(),
                "message", "Progress updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update progress"));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeOnboarding(
            @RequestBody Map<String, Object> onboardingData) {
        try {
            // Extract userId from the request data
            Long userId = Long.valueOf(onboardingData.get("userId").toString());
            User user = new User();
            user.setId(userId);

            // Remove userId from data before passing to service
            Map<String, Object> data = new HashMap<>(onboardingData);
            data.remove("userId");

            Onboarding onboarding = onboardingService.completeOnboarding(user, data);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Onboarding completed successfully",
                "onboarding", onboarding
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to complete onboarding"));
        }
    }

    @PostMapping("/skip")
    public ResponseEntity<Map<String, Object>> skipOnboarding(@RequestParam Long userId) {
        try {
            User user = new User();
            user.setId(userId);

            Onboarding onboarding = onboardingService.skipOnboarding(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Onboarding skipped successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to skip onboarding"));
        }
    }

    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam Long userId,
            @RequestParam String documentType,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = new User();
            user.setId(userId);

            String filePath = onboardingService.uploadDocument(user, file, documentType);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "filePath", filePath,
                "message", "Document uploaded successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    @GetMapping("/check-completion")
    public ResponseEntity<Map<String, Object>> checkCompletion(@RequestParam Long userId) {
        try {
            User user = new User();
            user.setId(userId);

            boolean isCompleted = onboardingService.isOnboardingCompleted(user);
            boolean isSkipped = onboardingService.isOnboardingSkipped(user);

            return ResponseEntity.ok(Map.of(
                "isCompleted", isCompleted,
                "isSkipped", isSkipped,
                "needsOnboarding", !isCompleted && !isSkipped
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to check completion status"));
        }
    }
}
