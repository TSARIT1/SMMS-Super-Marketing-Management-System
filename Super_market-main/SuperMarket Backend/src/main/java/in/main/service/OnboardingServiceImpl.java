package in.main.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.main.entities.Onboarding;
import in.main.entities.User;
import in.main.repository.OnboardingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OnboardingServiceImpl implements OnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingServiceImpl.class);

    private final OnboardingRepository onboardingRepository;
    private final ObjectMapper objectMapper;

    private static final String UPLOAD_DIR = "uploads/onboarding/";

    @Override
    public Onboarding getOnboardingByUser(User user) {
        return onboardingRepository.findByUser(user)
                .orElseGet(() -> createOnboardingForUser(user));
    }

    @Override
    public Onboarding getOnboardingByUserId(Long userId) {
        return onboardingRepository.findByUserId(userId)
                .orElse(null);
    }

    @Override
    public Onboarding createOnboardingForUser(User user) {
        Onboarding onboarding = new Onboarding();
        onboarding.setUser(user);
        onboarding.setIsCompleted(false);
        onboarding.setIsSkipped(false);
        onboarding.setCurrentStep(1);
        onboarding.setPersonalInfoCompleted(false);
        onboarding.setShopDetailsCompleted(false);
        onboarding.setDocumentsUploaded(false);
        return onboardingRepository.save(onboarding);
    }

    @Override
    public Onboarding updateOnboardingProgress(User user, int step, Map<String, Object> data) {
        Onboarding onboarding = getOnboardingByUser(user);
        onboarding.setCurrentStep(step);

        // Update completion status based on step
        switch (step) {
            case 1:
                onboarding.setPersonalInfoCompleted(true);
                break;
            case 2:
                onboarding.setShopDetailsCompleted(true);
                break;
            case 3:
                onboarding.setDocumentsUploaded(true);
                break;
        }

        // Store additional business info if provided
        if (data != null && !data.isEmpty()) {
            try {
                String businessInfoJson = objectMapper.writeValueAsString(data);
                onboarding.setBusinessInfo(businessInfoJson);
            } catch (Exception e) {
                // Log error but don't fail the operation
                logger.warn("Error serializing business info: {}", e.getMessage());
            }
        }

        return onboardingRepository.save(onboarding);
    }

    @Override
    public Onboarding completeOnboarding(User user, Map<String, Object> onboardingData) {
        Onboarding onboarding = getOnboardingByUser(user);
        onboarding.setIsCompleted(true);
        onboarding.setCurrentStep(3);
        onboarding.setPersonalInfoCompleted(true);
        onboarding.setShopDetailsCompleted(true);
        onboarding.setDocumentsUploaded(true);

        // Handle document paths from the data map
        if (onboardingData != null && !onboardingData.isEmpty()) {
            // Extract and set document paths
            if (onboardingData.containsKey("gstCertificatePath")) {
                onboarding.setGstCertificatePath(onboardingData.get("gstCertificatePath").toString());
            }
            if (onboardingData.containsKey("shopRegistrationCertificatePath")) {
                onboarding.setShopRegistrationCertificatePath(onboardingData.get("shopRegistrationCertificatePath").toString());
            }
            if (onboardingData.containsKey("panCardPath")) {
                onboarding.setPanCardPath(onboardingData.get("panCardPath").toString());
            }
            if (onboardingData.containsKey("aadhaarCardPath")) {
                onboarding.setAadhaarCardPath(onboardingData.get("aadhaarCardPath").toString());
            }
            if (onboardingData.containsKey("otherDocumentsPaths")) {
                try {
                    Object pathsObj = onboardingData.get("otherDocumentsPaths");
                    if (pathsObj instanceof List) {
                        onboarding.setOtherDocumentsPaths(objectMapper.writeValueAsString(pathsObj));
                    }
                } catch (Exception e) {
                    logger.warn("Error serializing other documents paths: {}", e.getMessage());
                }
            }

            // Store final business info
            try {
                String businessInfoJson = objectMapper.writeValueAsString(onboardingData);
                onboarding.setBusinessInfo(businessInfoJson);
            } catch (Exception e) {
                logger.warn("Error serializing final business info: {}", e.getMessage());
            }
        }

        return onboardingRepository.save(onboarding);
    }

    @Override
    public Onboarding skipOnboarding(User user) {
        Onboarding onboarding = getOnboardingByUser(user);
        onboarding.setIsSkipped(true);
        return onboardingRepository.save(onboarding);
    }

    @Override
    public boolean isOnboardingCompleted(User user) {
        return onboardingRepository.existsByUserAndIsCompleted(user, true);
    }

    @Override
    public boolean isOnboardingSkipped(User user) {
        Optional<Onboarding> onboarding = onboardingRepository.findByUser(user);
        return onboarding.isPresent() && Boolean.TRUE.equals(onboarding.get().getIsSkipped());
    }

    @Override
    public String uploadDocument(User user, MultipartFile file, String documentType) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = user.getId() + "_" + documentType + "_" +
                System.currentTimeMillis() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Update onboarding record with file path
            Onboarding onboarding = getOnboardingByUser(user);
            String relativePath = UPLOAD_DIR + filename;

            switch (documentType.toLowerCase()) {
                case "gst_certificate":
                    onboarding.setGstCertificatePath(relativePath);
                    break;
                case "shop_registration_certificate":
                    onboarding.setShopRegistrationCertificatePath(relativePath);
                    break;
                case "pan_card":
                    onboarding.setPanCardPath(relativePath);
                    break;
                case "aadhaar_card":
                    onboarding.setAadhaarCardPath(relativePath);
                    break;
                case "other_documents":
                    // Handle multiple other documents
                    String existingPaths = onboarding.getOtherDocumentsPaths();
                    List<String> paths = new ArrayList<>();
                    if (existingPaths != null && !existingPaths.trim().isEmpty()) {
                        try {
                            paths = objectMapper.readValue(existingPaths,
                                new TypeReference<List<String>>() {});
                        } catch (Exception e) {
                            paths = new ArrayList<>();
                        }
                    }
                    paths.add(relativePath);
                    onboarding.setOtherDocumentsPaths(objectMapper.writeValueAsString(paths));
                    break;
            }

            // Mark documents as uploaded if any document is uploaded
            onboarding.setDocumentsUploaded(true);

            onboardingRepository.save(onboarding);
            return relativePath;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }

    @Override
    public void deleteDocument(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            logger.warn("Failed to delete document: {}", e.getMessage());
        }
    }
}
