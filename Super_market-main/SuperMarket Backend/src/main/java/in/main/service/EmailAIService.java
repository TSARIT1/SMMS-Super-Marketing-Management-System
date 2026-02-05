package in.main.service;

import in.main.entities.EmailTemplate;
import in.main.entities.EmailLog;

import java.util.List;
import java.util.Map;

public interface EmailAIService {

    // AI-Powered Email Content Generation
    String generateEmailContent(String prompt, EmailTemplate.EmailType emailType);
    String generatePersonalizedEmailContent(String prompt, Map<String, Object> userData, EmailTemplate.EmailType emailType);
    String generateWelcomeEmail(String userName, String shopName, String additionalContext);
    String generateSupportResponse(String ticketDetails, String userQuery, String context);
    String generateMarketingEmail(String productInfo, String targetAudience, String promotionDetails);
    String generatePlanUpgradeEmail(String userName, String currentPlan, String targetPlan, String benefits);
    String generatePlanPromotionEmail(String planName, String discount, String validity, String targetUsers);

    // AI Email Optimization
    String optimizeEmailSubject(String subject, String content);
    String optimizeEmailContent(String content, String goal);
    String generateEmailSubject(String content, EmailTemplate.EmailType emailType);

    // AI Email Analysis
    Map<String, Object> analyzeEmailPerformance(String emailContent);
    String suggestEmailImprovements(String emailContent, Map<String, Double> metrics);
    boolean predictEmailSuccess(String subject, String content, String targetAudience);

    // AI Template Generation
    EmailTemplate generateTemplateFromPrompt(String prompt, EmailTemplate.EmailType emailType);
    EmailTemplate optimizeExistingTemplate(EmailTemplate template, String optimizationGoal);

    // AI Email Personalization
    String personalizeEmailContent(String baseContent, Map<String, Object> userProfile);
    Map<String, Object> generatePersonalizationVariables(Long userId);

    // AI Email Scheduling
    String suggestBestSendTime(Long userId, EmailTemplate.EmailType emailType);
    String suggestEmailFrequency(String userSegment, EmailTemplate.EmailType emailType);

    // AI Email A/B Testing
    Map<String, String> generateABTestVariants(String baseContent, String testGoal);
    String selectBestVariant(Map<String, Double> variantMetrics);

    // AI Email Compliance
    boolean checkEmailCompliance(String content, String region);
    String ensureUnsubscribeCompliance(String content);

    // AI Email Translation
    String translateEmailContent(String content, String targetLanguage);
    String generateMultilingualEmail(String baseContent, String[] languages);

    // AI Email Categorization
    String categorizeEmailContent(String content);
    EmailTemplate.EmailType detectEmailType(String content);

    // AI Email Sentiment Analysis
    Map<String, Object> analyzeEmailSentiment(String content);
    String adjustTone(String content, String desiredTone);

    // AI Email Automation
    boolean shouldSendEmail(Long userId, EmailTemplate.EmailType emailType, Map<String, Object> context);
    String generateAutomatedResponse(String userMessage, String context);

    // AI Email Monitoring
    Map<String, Object> monitorEmailPerformance();
    String generatePerformanceReport();

    // AI Image Generation for Emails
    String generateEmailBannerImage(String emailType, String theme, String dimensions);
    String generateProductShowcaseImage(String productName, String description, String style);
    String generatePromotionalImage(String promotionType, String message, String targetAudience);
    String generateBrandImage(String brandElements, String purpose, String colorScheme);
    String generateSeasonalImage(String season, String occasion, String emailContext);
    String generateCustomImage(String prompt, String style, String dimensions);

    // AI Image Optimization
    String optimizeImageForEmail(String imageUrl, String emailType);
    Map<String, Object> analyzeImageEffectiveness(String imageUrl, String emailContent);
    String suggestImageImprovements(String imageUrl, String emailGoal);

    // AI Image Management
    List<String> generateImageVariations(String baseImageUrl, int count);
    String generateResponsiveImages(String imageUrl, String[] breakpoints);
    boolean validateImageForEmail(String imageUrl);
}
