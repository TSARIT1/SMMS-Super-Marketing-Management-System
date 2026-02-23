package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI Operations Master Service
 * Central orchestrator for all AI-powered operations
 * Handles marketing, sales, revenue, maintenance, production, and global operations
 */
public interface AIOperationsMasterService {
    
    // ==================== MASTER CONTROLS ====================
    
    /**
     * Get overall AI operations status
     */
    Map<String, Object> getOperationsStatus();
    
    /**
     * Enable/disable all AI operations
     */
    Map<String, Object> toggleAIOperations(boolean enabled);
    
    /**
     * Get AI operations dashboard data
     */
    Map<String, Object> getAIOperationsDashboard();
    
    /**
     * Run all automated tasks
     */
    Map<String, Object> runAllAutomatedTasks();
    
    /**
     * Get AI system health
     */
    Map<String, Object> getSystemHealth();
    
    // ==================== AUTOMATED OPERATIONS ====================
    
    /**
     * Auto-optimize all operations
     */
    Map<String, Object> autoOptimizeAll();
    
    /**
     * Get automation schedule
     */
    Map<String, Object> getAutomationSchedule();
    
    /**
     * Update automation schedule
     */
    Map<String, Object> updateAutomationSchedule(Map<String, Object> schedule);
    
    /**
     * Get automation logs
     */
    List<Map<String, Object>> getAutomationLogs(int limit);
    
    // ==================== INTELLIGENT DECISION MAKING ====================
    
    /**
     * AI makes strategic decisions
     */
    Map<String, Object> makeStrategicDecision(String area, Map<String, Object> context);
    
    /**
     * Get AI recommendations for all areas
     */
    Map<String, Object> getAllRecommendations();
    
    /**
     * Execute AI recommendation
     */
    Map<String, Object> executeRecommendation(String recommendationId);
    
    // ==================== CROSS-DOMAIN OPERATIONS ====================
    
    /**
     * Analyze cross-domain impact
     */
    Map<String, Object> analyzeCrossDomainImpact(String action);
    
    /**
     * Optimize resource allocation across all domains
     */
    Map<String, Object> optimizeResourceAllocation();
    
    /**
     * Get unified metrics across all operations
     */
    Map<String, Object> getUnifiedMetrics();
    
    // ==================== PREDICTIVE OPERATIONS ====================
    
    /**
     * Predict future trends
     */
    Map<String, Object> predictTrends(int daysAhead);
    
    /**
     * Get risk assessment
     */
    Map<String, Object> assessRisks();
    
    /**
     * Generate contingency plans
     */
    Map<String, Object> generateContingencyPlans();
    
    // ==================== LEARNING & IMPROVEMENT ====================
    
    /**
     * Get AI learning insights
     */
    Map<String, Object> getLearningInsights();
    
    /**
     * Update AI models with new data
     */
    Map<String, Object> updateModels();
    
    /**
     * Get AI performance metrics
     */
    Map<String, Object> getAIPerformanceMetrics();
}