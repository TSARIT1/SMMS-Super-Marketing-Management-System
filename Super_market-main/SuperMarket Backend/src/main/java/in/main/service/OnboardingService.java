package in.main.service;

import in.main.entities.Onboarding;
import in.main.entities.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface OnboardingService {

    Onboarding getOnboardingByUser(User user);

    Onboarding getOnboardingByUserId(Long userId);

    Onboarding createOnboardingForUser(User user);

    Onboarding updateOnboardingProgress(User user, int step, Map<String, Object> data);

    Onboarding completeOnboarding(User user, Map<String, Object> onboardingData);

    Onboarding skipOnboarding(User user);

    boolean isOnboardingCompleted(User user);

    boolean isOnboardingSkipped(User user);

    String uploadDocument(User user, MultipartFile file, String documentType);

    void deleteDocument(String filePath);
}
