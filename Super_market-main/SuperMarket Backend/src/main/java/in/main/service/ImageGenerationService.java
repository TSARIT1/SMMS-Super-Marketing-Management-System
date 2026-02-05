package in.main.service;

import in.main.entities.EmailTemplate;
import java.util.List;
import java.util.Map;

/**
 * Service interface for AI-powered image generation specifically for email marketing
 */
public interface ImageGenerationService {

    /**
     * Generate banner image for email campaigns
     * @param emailType The type of email (welcome, marketing, promotional, etc.)
     * @param theme The theme or color scheme
     * @param dimensions Image dimensions (width x height)
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generateEmailBannerImage(String emailType, String theme, String dimensions);

    /**
     * Generate product showcase images for emails
     * @param productName Name of the product
     * @param description Product description
     * @param style Visual style (realistic, cartoon, etc.)
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generateProductShowcaseImage(String productName, String description, String style);

    /**
     * Generate promotional images for email campaigns
     * @param promotionType Type of promotion (discount, sale, new arrival, etc.)
     * @param message Promotional message
     * @param targetAudience Target audience description
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generatePromotionalImage(String promotionType, String message, String targetAudience);

    /**
     * Generate brand-consistent images for emails
     * @param brandElements Brand elements (logo, colors, style)
     * @param purpose Purpose of the image (header, footer, signature, etc.)
     * @param colorScheme Brand color scheme
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generateBrandImage(String brandElements, String purpose, String colorScheme);

    /**
     * Generate seasonal/holiday images for emails
     * @param season Season or holiday
     * @param occasion Specific occasion
     * @param emailContext Email context description
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generateSeasonalImage(String season, String occasion, String emailContext);

    /**
     * Generate custom images based on text prompts for emails
     * @param prompt Text description of desired image
     * @param style Visual style preference
     * @param dimensions Image dimensions
     * @return Map containing image URL and metadata
     */
    Map<String, Object> generateCustomEmailImage(String prompt, String style, String dimensions);

    /**
     * Generate multiple variations of an image
     * @param baseImageUrl URL of the base image
     * @param count Number of variations to generate
     * @return List of variation image URLs
     */
    List<String> generateImageVariations(String baseImageUrl, int count);

    /**
     * Optimize image for email delivery
     * @param imageUrl URL of the image to optimize
     * @param emailType Type of email for optimization
     * @return Optimized image URL
     */
    String optimizeImageForEmail(String imageUrl, String emailType);

    /**
     * Validate if image is suitable for email use
     * @param imageUrl URL of the image to validate
     * @return Validation result with any issues
     */
    Map<String, Object> validateImageForEmail(String imageUrl);

    /**
     * Get usage statistics for email image generation
     * @return Statistics including total images generated, usage by type, etc.
     */
    Map<String, Object> getEmailImageStats();

    /**
     * Store generated image in email assets storage
     * @param imageData The image binary data
     * @param metadata Image metadata including email context
     * @return Storage result with URL and ID
     */
    Map<String, Object> storeEmailImage(byte[] imageData, Map<String, Object> metadata);

    // Generic image generation API used by controllers
    default Map<String, Object> generateImage(String prompt, String model, Map<String, Object> options) {
        return Map.of("error", "Image generation not implemented", "prompt", prompt, "model", model);
    }

    default java.util.List<Map<String, Object>> getAvailableModels() {
        return java.util.List.of(Map.of("name", "dalle", "description", "Default DALL·E-like model"));
    }

    default Map<String, Object> getGenerationStats() {
        return Map.of("totalGenerated", 0, "errors", 0);
    }

    default Map<String, Object> validatePrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return Map.of("valid", false, "reason", "Prompt is empty");
        }
        // basic safety check placeholder
        if (prompt.toLowerCase().contains("nudity") || prompt.toLowerCase().contains("explicit")) {
            return Map.of("valid", false, "reason", "Contains disallowed content");
        }
        return Map.of("valid", true);
    }
}
