package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI Service interface - provides a set of AI related utilities used across the system.
 */
public interface AIService {

    Map<String, Object> analyzeSystemHealth();

    List<String> detectOrderAnomalies(List<Map<String, Object>> orderData);

    Map<Long, Integer> predictProductDemand(List<Map<String, Object>> historicalData);

    String autoResolveTicket(String ticketSubject, String ticketDescription);

    List<Map<String, Object>> generateSmartNotifications();

    Map<String, Object> optimizeInventory(List<Map<String, Object>> inventoryData);

    // Convenience default for generating free-form content. Implementations may override.
    default String generateContent(String prompt) { return "AI_UNAVAILABLE: " + prompt; }

    /**
     * Generate an image using AI based on text prompt
     * @param prompt The text description for image generation
     * @param model The AI model to use (dalle, midjourney, etc.)
     * @param options Additional options like size, style, etc.
     * @return Map containing image URL and metadata
     */
    default Map<String, Object> generateImage(String prompt, String model, Map<String, Object> options) {
        return Map.of("error", "Image generation not implemented");
    }

    /**
     * Get available AI models for image generation
     * @return List of available models with their capabilities
     */
    default List<Map<String, Object>> getImageGenerationModels() {
        return List.of();
    }
}

