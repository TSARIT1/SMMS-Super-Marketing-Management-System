package in.main.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Service Implementation for automated ticket resolution
 */
@Service
public class TicketAIServiceImpl implements TicketAIService {

    // Common issue patterns and their resolutions
    private static final Map<String, String> COMMON_ISSUES = new HashMap<>();
    private static final Map<String, String> KEYWORD_CATEGORIES = new HashMap<>();

    static {
        // Common issues and resolutions
        COMMON_ISSUES.put("password", "Please reset your password using the 'Forgot Password' link on the login page. If you continue to have issues, contact support with your registered email.");
        COMMON_ISSUES.put("login", "Please ensure you're using the correct email and password. Try clearing your browser cache or use an incognito window. If issues persist, use the password reset option.");
        COMMON_ISSUES.put("order.*status", "You can check your order status in your account dashboard under 'My Orders'. Orders typically process within 24 hours.");
        COMMON_ISSUES.put("payment.*fail", "Payment failures can occur due to insufficient funds, incorrect card details, or bank restrictions. Please try again with a different payment method or contact your bank.");
        COMMON_ISSUES.put("delivery.*delay", "Delivery times may vary based on your location and product availability. You can track your order status for real-time updates.");
        COMMON_ISSUES.put("refund", "Refunds are processed within 3-5 business days after approval. Please check your original payment method for the credited amount.");
        COMMON_ISSUES.put("product.*quality", "We're sorry to hear about the product quality issue. Please provide photos of the damaged item, and we'll arrange for a replacement or refund.");
        COMMON_ISSUES.put("account.*suspend", "Accounts may be suspended due to security concerns or policy violations. Please contact support for account recovery assistance.");

        // Keyword to category mapping
        KEYWORD_CATEGORIES.put("password|login|account", "Account Access");
        KEYWORD_CATEGORIES.put("order|purchase|buy", "Orders & Purchases");
        KEYWORD_CATEGORIES.put("payment|billing|refund", "Billing & Payments");
        KEYWORD_CATEGORIES.put("delivery|shipping|tracking", "Shipping & Delivery");
        KEYWORD_CATEGORIES.put("product|quality|damage|return", "Product Issues");
        KEYWORD_CATEGORIES.put("technical|error|bug|website", "Technical Support");
        KEYWORD_CATEGORIES.put("subscription|plan|upgrade", "Subscription");
    }

    @Override
    public String autoResolve(String subject, String description) {
        String combinedText = (subject + " " + description).toLowerCase();

        // Check for exact matches first
        for (Map.Entry<String, String> entry : COMMON_ISSUES.entrySet()) {
            if (combinedText.matches(".*" + entry.getKey() + ".*")) {
                return entry.getValue();
            }
        }

        // Check for pattern matches
        for (Map.Entry<String, String> entry : COMMON_ISSUES.entrySet()) {
            String pattern = entry.getKey().replace("*", ".*");
            if (combinedText.matches(".*" + pattern + ".*")) {
                return entry.getValue();
            }
        }

        // If no auto-resolution found, provide general guidance
        return "Thank you for contacting support. Our team will review your ticket and respond within 24 hours. For urgent issues, please call our support line.";
    }

    @Override
    public String categorizeTicket(String subject, String description) {
        String combinedText = (subject + " " + description).toLowerCase();

        for (Map.Entry<String, String> entry : KEYWORD_CATEGORIES.entrySet()) {
            String[] keywords = entry.getKey().split("\\|");
            for (String keyword : keywords) {
                if (combinedText.contains(keyword)) {
                    return entry.getValue();
                }
            }
        }

        return "General Inquiry";
    }

    @Override
    public List<String> suggestResponses(String subject, String description, List<String> conversationHistory) {
        List<String> suggestions = new ArrayList<>();
        String combinedText = (subject + " " + description).toLowerCase();

        // Base suggestions based on content
        if (combinedText.contains("urgent") || combinedText.contains("asap")) {
            suggestions.add("I understand this is urgent. I'll prioritize this and get back to you within 2 hours.");
        }

        if (combinedText.contains("refund") || combinedText.contains("return")) {
            suggestions.add("I'll process your refund request. Please provide your order number and reason for the return.");
            suggestions.add("Refunds are typically processed within 3-5 business days. Would you like me to check the status of your refund?");
        }

        if (combinedText.contains("technical") || combinedText.contains("error")) {
            suggestions.add("Could you please provide more details about the error you're experiencing? Screenshots would be very helpful.");
            suggestions.add("Let's try some basic troubleshooting steps. Have you tried clearing your browser cache and cookies?");
        }

        if (combinedText.contains("order") && combinedText.contains("wrong")) {
            suggestions.add("I'm sorry for the inconvenience. I'll arrange for the correct item to be sent and arrange pickup of the wrong item.");
        }

        // If no specific suggestions, provide general ones
        if (suggestions.isEmpty()) {
            suggestions.add("Thank you for providing this information. I'm looking into this for you now.");
            suggestions.add("I need a bit more information to help resolve this. Could you please clarify?");
            suggestions.add("I've escalated this to our senior support team for immediate assistance.");
        }

        return suggestions;
    }

    @Override
    public String predictPriority(String subject, String description) {
        String combinedText = (subject + " " + description).toLowerCase();

        // High priority keywords
        if (combinedText.contains("urgent") || combinedText.contains("emergency") ||
            combinedText.contains("account") && combinedText.contains("hack") ||
            combinedText.contains("security") || combinedText.contains("breach")) {
            return "HIGH";
        }

        // Medium priority keywords
        if (combinedText.contains("payment") && combinedText.contains("fail") ||
            combinedText.contains("order") && combinedText.contains("cancel") ||
            combinedText.contains("refund") || combinedText.contains("return") ||
            combinedText.contains("technical") && combinedText.contains("error")) {
            return "MEDIUM";
        }

        // Low priority for general inquiries
        return "LOW";
    }

    @Override
    public Map<String, Object> analyzeTicketPatterns(List<Map<String, Object>> ticketData) {
        Map<String, Object> analysis = new HashMap<>();

        // Analyze ticket categories
        Map<String, Integer> categoryCount = new HashMap<>();
        Map<String, Integer> priorityCount = new HashMap<>();
        Map<String, Integer> statusCount = new HashMap<>();
        Map<String, Double> resolutionTimeByCategory = new HashMap<>();

        for (Map<String, Object> ticket : ticketData) {
            String category = (String) ticket.getOrDefault("category", "Unknown");
            String priority = (String) ticket.getOrDefault("priority", "Unknown");
            String status = (String) ticket.getOrDefault("status", "Unknown");

            categoryCount.merge(category, 1, Integer::sum);
            priorityCount.merge(priority, 1, Integer::sum);
            statusCount.merge(status, 1, Integer::sum);

            // Calculate average resolution time by category
            if (ticket.containsKey("resolutionTimeHours")) {
                Double resolutionTime = ((Number) ticket.get("resolutionTimeHours")).doubleValue();
                resolutionTimeByCategory.merge(category,
                    resolutionTime,
                    (oldVal, newVal) -> (oldVal + newVal) / 2);
            }
        }

        // Find most common issues
        String mostCommonCategory = categoryCount.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Unknown");

        analysis.put("totalTickets", ticketData.size());
        analysis.put("categoryDistribution", categoryCount);
        analysis.put("priorityDistribution", priorityCount);
        analysis.put("statusDistribution", statusCount);
        analysis.put("mostCommonCategory", mostCommonCategory);
        analysis.put("averageResolutionTimeByCategory", resolutionTimeByCategory);

        // Generate insights
        List<String> insights = new ArrayList<>();
        if (categoryCount.getOrDefault("Technical Support", 0) > ticketData.size() * 0.3) {
            insights.add("High volume of technical support tickets suggests potential system issues that need attention.");
        }
        if (priorityCount.getOrDefault("HIGH", 0) > ticketData.size() * 0.2) {
            insights.add("Significant number of high-priority tickets indicates need for improved response times.");
        }

        analysis.put("insights", insights);

        return analysis;
    }
}
