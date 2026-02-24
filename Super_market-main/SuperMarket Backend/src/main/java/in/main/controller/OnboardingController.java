package in.main.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final ObjectMapper objectMapper;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOnboardingStatus(@RequestParam Long userId) {
        try {
            Onboarding onboarding = onboardingService.getOnboardingByUserId(userId);
            Map<String, Object> response = new HashMap<>();

            if (onboarding != null) {
                response.put("isCompleted", onboarding.getIsCompleted() != null ? onboarding.getIsCompleted() : false);
                response.put("isSkipped", onboarding.getIsSkipped() != null ? onboarding.getIsSkipped() : false);
                response.put("currentStep", onboarding.getCurrentStep() != null ? onboarding.getCurrentStep() : 1);
                response.put("personalInfoCompleted", onboarding.getPersonalInfoCompleted() != null ? onboarding.getPersonalInfoCompleted() : false);
                response.put("shopDetailsCompleted", onboarding.getShopDetailsCompleted() != null ? onboarding.getShopDetailsCompleted() : false);
                response.put("documentsUploaded", onboarding.getDocumentsUploaded() != null ? onboarding.getDocumentsUploaded() : false);
                
                // Include document paths (can be null)
                response.put("gstCertificatePath", onboarding.getGstCertificatePath());
                response.put("shopRegistrationCertificatePath", onboarding.getShopRegistrationCertificatePath());
                response.put("panCardPath", onboarding.getPanCardPath());
                response.put("aadhaarCardPath", onboarding.getAadhaarCardPath());
                response.put("otherDocumentsPaths", onboarding.getOtherDocumentsPaths());
                
                // Include business info
                if (onboarding.getBusinessInfo() != null && !onboarding.getBusinessInfo().isEmpty()) {
                    try {
                        Map<String, Object> businessInfoMap = objectMapper.readValue(
                            onboarding.getBusinessInfo(), 
                            objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)
                        );
                        response.put("businessInfo", businessInfoMap);
                    } catch (Exception e) {
                        response.put("businessInfo", onboarding.getBusinessInfo());
                    }
                }
                
                // Include timestamps (can be null)
                response.put("createdAt", onboarding.getCreatedAt());
                response.put("updatedAt", onboarding.getUpdatedAt());
                response.put("completedAt", onboarding.getCompletedAt());
            } else {
                // Return default values for users without onboarding record
                response.put("isCompleted", false);
                response.put("isSkipped", false);
                response.put("currentStep", 1);
                response.put("personalInfoCompleted", false);
                response.put("shopDetailsCompleted", false);
                response.put("documentsUploaded", false);
                response.put("gstCertificatePath", null);
                response.put("shopRegistrationCertificatePath", null);
                response.put("panCardPath", null);
                response.put("aadhaarCardPath", null);
                response.put("otherDocumentsPaths", null);
                response.put("businessInfo", null);
                response.put("createdAt", null);
                response.put("updatedAt", null);
                response.put("completedAt", null);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the actual error for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to get onboarding status",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
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
            @RequestParam("userId") Long userId,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "shopName", required = false) String shopName,
            @RequestParam(value = "shopAddress", required = false) String shopAddress,
            @RequestParam(value = "shopType", required = false) String shopType,
            @RequestParam(value = "establishedYear", required = false) String establishedYear,
            @RequestParam(value = "gstNumber", required = false) String gstNumber,
            @RequestParam(value = "panNumber", required = false) String panNumber,
            @RequestParam(value = "businessCategory", required = false) String businessCategory,
            @RequestParam(value = "employeeCount", required = false) String employeeCount,
            @RequestParam(value = "gstCertificate", required = false) MultipartFile gstCertificate,
            @RequestParam(value = "shopRegistrationCertificate", required = false) MultipartFile shopRegistrationCertificate,
            @RequestParam(value = "panCard", required = false) MultipartFile panCard,
            @RequestParam(value = "aadhaarCard", required = false) MultipartFile aadhaarCard,
            @RequestParam(value = "otherDocuments", required = false) MultipartFile[] otherDocuments) {
        try {
            User user = new User();
            user.setId(userId);

            // Build onboarding data map
            Map<String, Object> data = new HashMap<>();
            if (fullName != null) data.put("fullName", fullName);
            if (email != null) data.put("email", email);
            if (phone != null) data.put("phone", phone);
            if (shopName != null) data.put("shopName", shopName);
            if (shopAddress != null) data.put("shopAddress", shopAddress);
            if (shopType != null) data.put("shopType", shopType);
            if (establishedYear != null) data.put("establishedYear", establishedYear);
            if (gstNumber != null) data.put("gstNumber", gstNumber);
            if (panNumber != null) data.put("panNumber", panNumber);
            if (businessCategory != null) data.put("businessCategory", businessCategory);
            if (employeeCount != null) data.put("employeeCount", employeeCount);

            // Handle file uploads
            if (gstCertificate != null && !gstCertificate.isEmpty()) {
                String path = onboardingService.uploadDocument(user, gstCertificate, "gst_certificate");
                data.put("gstCertificatePath", path);
            }
            if (shopRegistrationCertificate != null && !shopRegistrationCertificate.isEmpty()) {
                String path = onboardingService.uploadDocument(user, shopRegistrationCertificate, "shop_registration_certificate");
                data.put("shopRegistrationCertificatePath", path);
            }
            if (panCard != null && !panCard.isEmpty()) {
                String path = onboardingService.uploadDocument(user, panCard, "pan_card");
                data.put("panCardPath", path);
            }
            if (aadhaarCard != null && !aadhaarCard.isEmpty()) {
                String path = onboardingService.uploadDocument(user, aadhaarCard, "aadhaar_card");
                data.put("aadhaarCardPath", path);
            }
            if (otherDocuments != null && otherDocuments.length > 0) {
                List<String> paths = new ArrayList<>();
                for (MultipartFile doc : otherDocuments) {
                    if (doc != null && !doc.isEmpty()) {
                        String path = onboardingService.uploadDocument(user, doc, "other_documents");
                        paths.add(path);
                    }
                }
                data.put("otherDocumentsPaths", paths);
            }

            Onboarding onboarding = onboardingService.completeOnboarding(user, data);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Onboarding completed successfully",
                "onboarding", onboarding
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to complete onboarding: " + e.getMessage()));
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

    /**
     * AI-powered analysis of onboarding data
     * Provides suggestions for improving business profile
     */
    @PostMapping("/ai/analyze")
    public ResponseEntity<Map<String, Object>> analyzeOnboardingWithAI(@RequestBody Map<String, Object> request) {
        try {
            Long userId = request.get("userId") != null ? 
                Long.valueOf(request.get("userId").toString()) : null;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> onboardingData = request.get("onboardingData") != null ?
                (Map<String, Object>) request.get("onboardingData") : new HashMap<>();
            
            // Get existing onboarding data if available
            if (userId != null) {
                Onboarding existing = onboardingService.getOnboardingByUserId(userId);
                if (existing != null && existing.getBusinessInfo() != null) {
                    try {
                        Map<String, Object> existingInfo = objectMapper.readValue(
                            existing.getBusinessInfo(),
                            objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)
                        );
                        // Merge with provided data
                        existingInfo.putAll(onboardingData);
                        onboardingData = existingInfo;
                    } catch (Exception e) {
                        // Use provided data only
                    }
                }
            }
            
            List<Map<String, Object>> suggestions = new ArrayList<>();
            
            // Analyze GST compliance
            String gstNumber = (String) onboardingData.get("gstNumber");
            if (gstNumber == null || gstNumber.trim().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "warning",
                    "message", "GST registration is recommended for businesses with turnover above ₹40 lakhs. It enables input tax credit and compliance.",
                    "action", "Add GST Number",
                    "priority", "high"
                ));
            } else if (!isValidGSTFormat(gstNumber)) {
                suggestions.add(Map.of(
                    "type", "warning",
                    "message", "GST number format appears invalid. Please verify your 15-character GSTIN.",
                    "action", "Verify GST Number",
                    "priority", "medium"
                ));
            }
            
            // Analyze PAN
            String panNumber = (String) onboardingData.get("panNumber");
            if (panNumber == null || panNumber.trim().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "info",
                    "message", "PAN number is essential for tax compliance and business verification. It's required for banking and official transactions.",
                    "action", "Add PAN Number",
                    "priority", "high"
                ));
            } else if (!isValidPANFormat(panNumber)) {
                suggestions.add(Map.of(
                    "type", "warning",
                    "message", "PAN number format appears invalid. Please verify your 10-character PAN.",
                    "action", "Verify PAN Number",
                    "priority", "medium"
                ));
            }
            
            // Analyze business category
            String businessCategory = (String) onboardingData.get("businessCategory");
            if (businessCategory == null || businessCategory.trim().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "info",
                    "message", "Selecting a business category helps personalize your dashboard and get relevant insights for your industry.",
                    "action", "Select Category",
                    "priority", "low"
                ));
            }
            
            // Analyze employee count
            Object employeeCountObj = onboardingData.get("employeeCount");
            if (employeeCountObj == null || employeeCountObj.toString().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "info",
                    "message", "Adding employee count helps us customize features for your business size and suggest relevant HR tools.",
                    "action", "Add Employee Count",
                    "priority", "low"
                ));
            }
            
            // Analyze shop type
            String shopType = (String) onboardingData.get("shopType");
            if (shopType == null || shopType.trim().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "info",
                    "message", "Specifying your shop type helps tailor the inventory and sales features to your business model.",
                    "action", "Select Shop Type",
                    "priority", "medium"
                ));
            }
            
            // Analyze established year
            Object establishedYearObj = onboardingData.get("establishedYear");
            if (establishedYearObj == null || establishedYearObj.toString().isEmpty()) {
                suggestions.add(Map.of(
                    "type", "info",
                    "message", "Adding your establishment year builds trust with customers and enables business anniversary features.",
                    "action", "Add Established Year",
                    "priority", "low"
                ));
            }
            
            // Check for documents
            if (userId != null) {
                Onboarding onboarding = onboardingService.getOnboardingByUserId(userId);
                if (onboarding != null) {
                    if (onboarding.getGstCertificatePath() == null && onboarding.getPanCardPath() == null) {
                        suggestions.add(Map.of(
                            "type", "warning",
                            "message", "Uploading verification documents helps speed up account verification and enables advanced features.",
                            "action", "Upload Documents",
                            "priority", "medium"
                        ));
                    }
                }
            }
            
            // Calculate completion score
            int completionScore = calculateCompletionScore(onboardingData);
            
            // Generate business insights
            List<String> insights = generateBusinessInsights(onboardingData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("suggestions", suggestions);
            response.put("completionScore", completionScore);
            response.put("insights", insights);
            response.put("analyzedAt", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to analyze onboarding data",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Validate GST number format (basic validation)
     */
    private boolean isValidGSTFormat(String gst) {
        if (gst == null) return false;
        String cleanGst = gst.replaceAll("\\s", "").toUpperCase();
        return cleanGst.matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");
    }
    
    /**
     * Validate PAN number format
     */
    private boolean isValidPANFormat(String pan) {
        if (pan == null) return false;
        String cleanPan = pan.replaceAll("\\s", "").toUpperCase();
        return cleanPan.matches("^[A-Z]{5}[0-9]{4}[A-Z]{1}$");
    }
    
    /**
     * Calculate profile completion score
     */
    private int calculateCompletionScore(Map<String, Object> data) {
        int score = 0;
        int maxScore = 100;
        
        // Personal info (30 points)
        if (data.get("fullName") != null && !data.get("fullName").toString().isEmpty()) score += 10;
        if (data.get("phone") != null && !data.get("phone").toString().isEmpty()) score += 10;
        if (data.get("email") != null && !data.get("email").toString().isEmpty()) score += 10;
        
        // Shop details (30 points)
        if (data.get("shopName") != null && !data.get("shopName").toString().isEmpty()) score += 10;
        if (data.get("shopAddress") != null && !data.get("shopAddress").toString().isEmpty()) score += 10;
        if (data.get("shopType") != null && !data.get("shopType").toString().isEmpty()) score += 10;
        
        // Business info (40 points)
        if (data.get("gstNumber") != null && !data.get("gstNumber").toString().isEmpty()) score += 15;
        if (data.get("panNumber") != null && !data.get("panNumber").toString().isEmpty()) score += 10;
        if (data.get("businessCategory") != null && !data.get("businessCategory").toString().isEmpty()) score += 10;
        if (data.get("employeeCount") != null && !data.get("employeeCount").toString().isEmpty()) score += 5;
        
        return Math.min(score, maxScore);
    }
    
    /**
     * Generate business insights based on provided data
     */
    private List<String> generateBusinessInsights(Map<String, Object> data) {
        List<String> insights = new ArrayList<>();
        
        String shopType = (String) data.get("shopType");
        if ("supermarket".equals(shopType)) {
            insights.add("As a supermarket, consider enabling multi-category inventory management for better organization.");
            insights.add("Supermarkets typically benefit from loyalty programs to retain customers.");
        } else if ("grocery".equals(shopType)) {
            insights.add("Grocery stores benefit from daily stock tracking to minimize perishable waste.");
            insights.add("Consider setting up quick billing for faster checkout during peak hours.");
        } else if ("convenience".equals(shopType)) {
            insights.add("Convenience stores thrive on quick service - optimize your POS for speed.");
            insights.add("Consider extended hours features to manage shift-based operations.");
        }
        
        Object employeeCountObj = data.get("employeeCount");
        if (employeeCountObj != null) {
            try {
                int empCount = Integer.parseInt(employeeCountObj.toString());
                if (empCount > 10) {
                    insights.add("With " + empCount + " employees, consider enabling staff management and shift scheduling features.");
                } else if (empCount <= 3) {
                    insights.add("For small teams, focus on multi-role access and simplified workflows.");
                }
            } catch (NumberFormatException ignored) {}
        }
        
        return insights;
    }
}
