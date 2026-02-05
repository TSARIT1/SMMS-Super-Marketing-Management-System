package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI Service Interface for automated ticket resolution and support
 */
public interface TicketAIService {

    /**
     * Auto-resolve common support tickets
     */
    String autoResolve(String subject, String description);

    /**
     * Categorize tickets based on content
     */
    String categorizeTicket(String subject, String description);

    /**
     * Suggest appropriate responses for tickets
     */
    List<String> suggestResponses(String subject, String description, List<String> conversationHistory);

    /**
     * Predict ticket priority based on content
     */
    String predictPriority(String subject, String description);

    /**
     * Analyze ticket patterns and provide insights
     */
    Map<String, Object> analyzeTicketPatterns(List<Map<String, Object>> ticketData);
}
