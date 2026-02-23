package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI Support Automation Service
 * Handles automated customer support, email support, call support, and ticket management
 */
public interface AISupportAutomationService {
    
    // Automated Ticket Management
    Map<String, Object> autoRespondToTicket(Long ticketId);
    Map<String, Object> categorizeTicket(Long ticketId);
    Map<String, Object> prioritizeTicket(Long ticketId);
    Map<String, Object> assignTicketToAgent(Long ticketId);
    Map<String, Object> suggestSolution(Long ticketId);
    
    // Email Support Automation
    Map<String, Object> generateEmailResponse(String emailContent, String context);
    Map<String, Object> autoReplyToEmail(Long emailLogId);
    Map<String, Object> classifyEmailIntent(String emailContent);
    Map<String, Object> extractEmailEntities(String emailContent);
    
    // Call Support Automation
    Map<String, Object> generateCallScript(String scenario);
    Map<String, Object> analyzeCallSentiment(String transcript);
    Map<String, Object> suggestCallResolution(String issue);
    Map<String, Object> generateCallSummary(String transcript);
    
    // Knowledge Base
    Map<String, Object> searchKnowledgeBase(String query);
    Map<String, Object> generateKnowledgeArticle(String topic);
    Map<String, Object> updateKnowledgeBase(String articleId, Map<String, Object> updates);
    List<Map<String, Object>> getRelatedArticles(String topic);
    
    // Proactive Support
    Map<String, Object> detectPotentialIssues(Long userId);
    Map<String, Object> sendProactiveNotification(Long userId, String issueType);
    Map<String, Object> scheduleFollowUp(Long ticketId, int daysDelay);
    
    // Analytics & Reporting
    Map<String, Object> getSupportAnalytics();
    Map<String, Object> getAgentPerformanceMetrics(Long agentId);
    Map<String, Object> getCustomerSatisfactionTrends();
    Map<String, Object> getSupportDashboard();
    
    // AI Chatbot
    Map<String, Object> processChatMessage(String message, Long userId);
    Map<String, Object> escalateToHuman(Long chatSessionId);
    Map<String, Object> getChatbotCapabilities();
}