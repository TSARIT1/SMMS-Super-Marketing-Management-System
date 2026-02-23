package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI Code Maintenance Service
 * Handles automated code analysis, bug detection, and maintenance tasks
 */
public interface AICodeMaintenanceService {
    
    // ==================== CODE ANALYSIS ====================
    
    /**
     * Analyze codebase for issues
     */
    Map<String, Object> analyzeCodebase();
    
    /**
     * Detect bugs in code
     */
    Map<String, Object> detectBugs(String module);
    
    /**
     * Analyze code quality
     */
    Map<String, Object> analyzeCodeQuality();
    
    /**
     * Check security vulnerabilities
     */
    Map<String, Object> checkSecurityVulnerabilities();
    
    /**
     * Analyze dependencies
     */
    Map<String, Object> analyzeDependencies();
    
    // ==================== AUTOMATED FIXES ====================
    
    /**
     * Auto-fix detected issues
     */
    Map<String, Object> autoFixIssues(List<String> issueIds);
    
    /**
     * Generate fix suggestion
     */
    Map<String, Object> generateFixSuggestion(String issueId);
    
    /**
     * Apply code optimization
     */
    Map<String, Object> applyCodeOptimization(String optimizationType);
    
    /**
     * Refactor code
     */
    Map<String, Object> refactorCode(String filePath, String refactoringType);
    
    // ==================== MAINTENANCE TASKS ====================
    
    /**
     * Run scheduled maintenance
     */
    Map<String, Object> runScheduledMaintenance();
    
    /**
     * Clean up technical debt
     */
    Map<String, Object> cleanupTechnicalDebt();
    
    /**
     * Update dependencies
     */
    Map<String, Object> updateDependencies();
    
    /**
     * Generate documentation
     */
    Map<String, Object> generateDocumentation(String module);
    
    // ==================== MONITORING ====================
    
    /**
     * Get code health metrics
     */
    Map<String, Object> getCodeHealthMetrics();
    
    /**
     * Get maintenance logs
     */
    List<Map<String, Object>> getMaintenanceLogs(int limit);
    
    /**
     * Get issue tracking
     */
    Map<String, Object> getIssueTracking();
    
    /**
     * Get technical debt report
     */
    Map<String, Object> getTechnicalDebtReport();
    
    // ==================== INTELLIGENT SUGGESTIONS ====================
    
    /**
     * Get improvement suggestions
     */
    Map<String, Object> getImprovementSuggestions();
    
    /**
     * Prioritize maintenance tasks
     */
    Map<String, Object> prioritizeMaintenanceTasks();
    
    /**
     * Predict potential issues
     */
    Map<String, Object> predictPotentialIssues();
    
    /**
     * Generate code review comments
     */
    Map<String, Object> generateCodeReviewComments(String filePath);
}