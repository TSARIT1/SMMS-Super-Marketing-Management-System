package in.main.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.main.entities.Onboarding;
import in.main.entities.User;
import in.main.repository.OnboardingRepository;
import lombok.RequiredArgsConstructor;
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
                System.err.println("Error serializing business info: " + e.getMessage());
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

        // Store final business info
        if (onboardingData != null && !onboardingData.isEmpty()) {
            try {
                String businessInfoJson = objectMapper.writeValueAsString(onboardingData);
                onboarding.setBusinessInfo(businessInfoJson);
            } catch (Exception e) {
                System.err.println("Error serializing final business info: " + e.getMessage());
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
            System.err.println("Failed to delete document: " + e.getMessage());
        }
    }
}
