package in.main.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of AI-powered image generation service specifically for email marketing
 */
@Service
public class ImageGenerationServiceImpl implements ImageGenerationService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${stability.api.key:}")
    private String stabilityApiKey;

    @Value("${midjourney.api.key:}")
    private String midjourneyApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Rate limiting maps
    private final Map<String, Long> lastRequestTime = new ConcurrentHashMap<>();
    private final Map<String, Integer> requestCount = new ConcurrentHashMap<>();

    // Email image statistics
    private final Map<String, Integer> imageTypeStats = new ConcurrentHashMap<>();
    private int totalEmailImagesGenerated = 0;

    @Override
    public Map<String, Object> generateEmailBannerImage(String emailType, String theme, String dimensions) {
        String prompt = buildEmailBannerPrompt(emailType, theme, dimensions);
        return generateImage(prompt, "dalle", Map.of("emailType", emailType, "purpose", "banner"));
    }

    @Override
    public Map<String, Object> generateProductShowcaseImage(String productName, String description, String style) {
        String prompt = buildProductShowcasePrompt(productName, description, style);
        return generateImage(prompt, "dalle", Map.of("emailType", "product", "purpose", "showcase"));
    }

    @Override
    public Map<String, Object> generatePromotionalImage(String promotionType, String message, String targetAudience) {
        String prompt = buildPromotionalPrompt(promotionType, message, targetAudience);
        return generateImage(prompt, "dalle", Map.of("emailType", "promotional", "purpose", "marketing"));
    }

    @Override
    public Map<String, Object> generateBrandImage(String brandElements, String purpose, String colorScheme) {
        String prompt = buildBrandPrompt(brandElements, purpose, colorScheme);
        return generateImage(prompt, "stability", Map.of("emailType", "brand", "purpose", purpose));
    }

    @Override
    public Map<String, Object> generateSeasonalImage(String season, String occasion, String emailContext) {
        String prompt = buildSeasonalPrompt(season, occasion, emailContext);
        return generateImage(prompt, "dalle", Map.of("emailType", "seasonal", "purpose", "holiday"));
    }

    @Override
    public Map<String, Object> generateCustomEmailImage(String prompt, String style, String dimensions) {
        Map<String, Object> options = Map.of(
            "style", style,
            "dimensions", dimensions,
            "emailOptimized", true
        );
        return generateImage(prompt, "dalle", options);
    }

    @Override
    public List<String> generateImageVariations(String baseImageUrl, int count) {
        // This would require additional implementation for variation generation
        // For now, return empty list
        return new ArrayList<>();
    }

    @Override
    public String optimizeImageForEmail(String imageUrl, String emailType) {
        // Basic optimization - in production, this would resize/compress images
        return imageUrl;
    }

    @Override
    public Map<String, Object> validateImageForEmail(String imageUrl) {
        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("warnings", new ArrayList<>());
        result.put("emailCompatible", true);
        return result;
    }

    @Override
    public Map<String, Object> getEmailImageStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmailImagesGenerated", totalEmailImagesGenerated);
        stats.put("imagesByType", new HashMap<>(imageTypeStats));
        stats.put("lastGenerated", LocalDateTime.now());
        return stats;
    }

    @Override
    public Map<String, Object> storeEmailImage(byte[] imageData, Map<String, Object> metadata) {
        // In production, this would store to cloud storage (S3, Cloudinary, etc.)
        // For now, return mock storage result
        Map<String, Object> result = new HashMap<>();
        result.put("url", "https://example.com/email-images/" + UUID.randomUUID() + ".png");
        result.put("id", UUID.randomUUID().toString());
        result.put("stored", true);
        result.put("metadata", metadata);
        return result;
    }



    private Map<String, Object> generateWithDalle(String prompt, Map<String, Object> options) {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            return Map.of("error", "OpenAI API key not configured");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", prompt);
            requestBody.put("n", 1);
            requestBody.put("size", "1024x1024");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/images/generations",
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                if (data != null && !data.isEmpty()) {
                    Map<String, Object> result = new HashMap<>();
                    result.put("url", data.get(0).get("url"));
                    result.put("model", "dalle-3");
                    result.put("prompt", prompt);
                    result.put("generatedAt", LocalDateTime.now());
                    result.put("emailOptimized", true);
                    return result;
                }
            }

            return Map.of("error", "Failed to generate image with DALL-E");

        } catch (Exception e) {
            return Map.of("error", "DALL-E API error: " + e.getMessage());
        }
    }

    private Map<String, Object> generateWithStability(String prompt, Map<String, Object> options) {
        if (stabilityApiKey == null || stabilityApiKey.isEmpty()) {
            return Map.of("error", "Stability AI API key not configured");
        }

        // Stability AI implementation would go here
        return Map.of("error", "Stability AI integration not yet implemented");
    }

    private Map<String, Object> generateWithMidjourney(String prompt, Map<String, Object> options) {
        if (midjourneyApiKey == null || midjourneyApiKey.isEmpty()) {
            return Map.of("error", "Midjourney API key not configured");
        }

        // Midjourney implementation would go here
        return Map.of("error", "Midjourney integration not yet implemented");
    }

    private boolean checkRateLimit(String model) {
        long now = System.currentTimeMillis();
        String key = model + "_requests";

        // Reset counter if more than a minute has passed
        if (now - lastRequestTime.getOrDefault(key, 0L) > 60000) {
            requestCount.put(key, 0);
            lastRequestTime.put(key, now);
        }

        int currentCount = requestCount.getOrDefault(key, 0);
        int limit = getRateLimitForModel(model);

        if (currentCount >= limit) {
            return false;
        }

        requestCount.put(key, currentCount + 1);
        return true;
    }

    private int getRateLimitForModel(String model) {
        switch (model.toLowerCase()) {
            case "dalle": return 50; // 50 requests per minute
            case "stability": return 150; // 150 requests per minute
            case "midjourney": return 100; // 100 requests per minute
            default: return 10;
        }
    }

    private String buildEmailBannerPrompt(String emailType, String theme, String dimensions) {
        return String.format(
            "Create a professional email banner image for a %s email with %s theme. " +
            "Dimensions: %s. Make it visually appealing, modern design, suitable for email marketing. " +
            "Ensure good contrast for text overlay, clean and professional look.",
            emailType, theme, dimensions
        );
    }

    private String buildProductShowcasePrompt(String productName, String description, String style) {
        return String.format(
            "Create a product showcase image for '%s'. Description: %s. " +
            "Style: %s. Make it suitable for email marketing, professional, " +
            "high-quality, and visually appealing to showcase the product effectively.",
            productName, description, style
        );
    }

    private String buildPromotionalPrompt(String promotionType, String message, String targetAudience) {
        return String.format(
            "Create a promotional banner for %s campaign. Message: '%s'. " +
            "Target audience: %s. Design should be eye-catching, professional, " +
            "and optimized for email marketing with clear call-to-action elements.",
            promotionType, message, targetAudience
        );
    }

    private String buildBrandPrompt(String brandElements, String purpose, String colorScheme) {
        return String.format(
            "Create a brand image incorporating: %s. Purpose: %s. " +
            "Color scheme: %s. Ensure brand consistency, professional appearance, " +
            "and suitability for email headers, footers, or signatures.",
            brandElements, purpose, colorScheme
        );
    }

    private String buildSeasonalPrompt(String season, String occasion, String emailContext) {
        return String.format(
            "Create a seasonal email image for %s season, occasion: %s. " +
            "Context: %s. Make it festive, appropriate for the season, " +
            "visually appealing, and optimized for email marketing campaigns.",
            season, occasion, emailContext
        );
    }

    @Override
    public Map<String, Object> generateImage(String prompt, String model, Map<String, Object> options) {
        try {
            // Rate limiting check
            if (!checkRateLimit(model)) {
                return Map.of("error", "Rate limit exceeded for " + model);
            }

            Map<String, Object> result = null;

            switch (model.toLowerCase()) {
                case "dalle":
                    result = generateWithDalle(prompt, options);
                    break;
                case "stability":
                    result = generateWithStability(prompt, options);
                    break;
                case "midjourney":
                    result = generateWithMidjourney(prompt, options);
                    break;
                default:
                    result = generateWithDalle(prompt, options);
            }

            if (result != null && !result.containsKey("error")) {
                totalEmailImagesGenerated++;
                String emailType = (String) options.getOrDefault("emailType", "custom");
                imageTypeStats.put(emailType, imageTypeStats.getOrDefault(emailType, 0) + 1);
            }

            return result;

        } catch (Exception e) {
            return Map.of("error", "Image generation failed: " + e.getMessage());
        }
    }

    @Override
    public java.util.List<Map<String, Object>> getAvailableModels() {
        java.util.List<Map<String, Object>> models = new java.util.ArrayList<>();
        models.add(Map.of(
            "name", "dalle",
            "description", "DALL·E 3 by OpenAI - High quality image generation",
            "capabilities", java.util.List.of("text-to-image", "variations"),
            "maxPromptLength", 4000,
            "supportedSizes", java.util.List.of("1024x1024", "1792x1024", "1024x1792")
        ));
        models.add(Map.of(
            "name", "stability",
            "description", "Stability AI - Fast and creative image generation",
            "capabilities", java.util.List.of("text-to-image"),
            "maxPromptLength", 2000,
            "supportedSizes", java.util.List.of("512x512", "768x768", "1024x1024")
        ));
        models.add(Map.of(
            "name", "midjourney",
            "description", "Midjourney - Artistic and detailed image generation",
            "capabilities", java.util.List.of("text-to-image", "variations", "upscaling"),
            "maxPromptLength", 6000,
            "supportedSizes", java.util.List.of("1024x1024", "2048x2048")
        ));
        return models;
    }

    @Override
    public Map<String, Object> getGenerationStats() {
        return Map.of(
            "totalGenerated", totalEmailImagesGenerated,
            "imagesByType", new HashMap<>(imageTypeStats),
            "lastGenerated", LocalDateTime.now(),
            "apiKeysConfigured", Map.of(
                "openai", openaiApiKey != null && !openaiApiKey.isEmpty(),
                "stability", stabilityApiKey != null && !stabilityApiKey.isEmpty(),
                "midjourney", midjourneyApiKey != null && !midjourneyApiKey.isEmpty()
            ),
            "rateLimits", Map.of(
                "dalle", Map.of("current", requestCount.getOrDefault("dalle_requests", 0), "limit", 50),
                "stability", Map.of("current", requestCount.getOrDefault("stability_requests", 0), "limit", 150),
                "midjourney", Map.of("current", requestCount.getOrDefault("midjourney_requests", 0), "limit", 100)
            )
        );
    }

    @Override
    public Map<String, Object> validatePrompt(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return Map.of("valid", false, "reason", "Prompt cannot be empty");
        }

        if (prompt.length() > 4000) {
            return Map.of("valid", false, "reason", "Prompt too long (max 4000 characters)");
        }

        // Check for potentially harmful content
        String lowerPrompt = prompt.toLowerCase();
        java.util.List<String> disallowedTerms = java.util.List.of(
            "nudity", "explicit", "nsfw", "adult content", "violence", "harmful"
        );

        for (String term : disallowedTerms) {
            if (lowerPrompt.contains(term)) {
                return Map.of("valid", false, "reason", "Prompt contains disallowed content: " + term);
            }
        }

        return Map.of("valid", true, "length", prompt.length());
    }
}
