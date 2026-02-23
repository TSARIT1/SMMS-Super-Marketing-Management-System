package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * Auto-Fix AI Service
 * Automatically detects and fixes issues in the system
 * 
 * Features:
 * - Automatic bug detection and fixing
 * - Performance optimization
 * - Security vulnerability patching
 * - Database optimization
 * - Code quality improvements
 */
public interface AutoFixAIService {
    
    // ==================== SYSTEM HEALTH MONITORING ====================
    
    /**
     * Run comprehensive system health check
     */
    Map<String, Object> runSystemHealthCheck();
    
    /**
     * Detect all system issues
     */
    Map<String, Object> detectAllIssues();
    
    /**
     * Get system health score
     */
    Map<String, Object> getSystemHealthScore();
    
    /**
     * Get critical issues requiring immediate attention
     */
    List<Map<String, Object>> getCriticalIssues();
    
    // ==================== AUTOMATIC FIXING ====================
    
    /**
     * Auto-fix all detected issues
     */
    Map<String, Object> autoFixAllIssues();
    
    /**
     * Auto-fix specific issue by ID
     */
    Map<String, Object> autoFixIssue(String issueId);
    
    /**
     * Auto-fix performance issues
     */
    Map<String, Object> autoFixPerformanceIssues();
    
    /**
     * Auto-fix security vulnerabilities
     */
    Map<String, Object> autoFixSecurityVulnerabilities();
    
    /**
     * Auto-fix database issues
     */
    Map<String, Object> autoFixDatabaseIssues();
    
    // ==================== PERFORMANCE OPTIMIZATION ====================
    
    /**
     * Optimize system performance
     */
    Map<String, Object> optimizePerformance();
    
    /**
     * Optimize database queries
     */
    Map<String, Object> optimizeDatabaseQueries();
    
    /**
     * Optimize memory usage
     */
    Map<String, Object> optimizeMemoryUsage();
    
    /**
     * Optimize cache configuration
     */
    Map<String, Object> optimizeCacheConfiguration();
    
    /**
     * Clear system caches
     */
    Map<String, Object> clearSystemCaches();
    
    // ==================== SECURITY AUTOMATION ====================
    
    /**
     * Run security scan
     */
    Map<String, Object> runSecurityScan();
    
    /**
     * Patch security vulnerabilities
     */
    Map<String, Object> patchSecurityVulnerabilities();
    
    /**
     * Update security configurations
     */
    Map<String, Object> updateSecurityConfigurations();
    
    /**
     * Rotate security credentials
     */
    Map<String, Object> rotateSecurityCredentials();
    
    /**
     * Audit access permissions
     */
    Map<String, Object> auditAccessPermissions();
    
    // ==================== DATABASE MAINTENANCE ====================
    
    /**
     * Optimize database tables
     */
    Map<String, Object> optimizeDatabaseTables();
    
    /**
     * Analyze query performance
     */
    Map<String, Object> analyzeQueryPerformance();
    
    /**
     * Clean up old data
     */
    Map<String, Object> cleanupOldData();
    
    /**
     * Rebuild database indexes
     */
    Map<String, Object> rebuildDatabaseIndexes();
    
    /**
     * Check database integrity
     */
    Map<String, Object> checkDatabaseIntegrity();
    
    // ==================== LOG MANAGEMENT ====================
    
    /**
     * Analyze system logs
     */
    Map<String, Object> analyzeSystemLogs();
    
    /**
     * Detect anomalies in logs
     */
    List<Map<String, Object>> detectLogAnomalies();
    
    /**
     * Archive old logs
     */
    Map<String, Object> archiveOldLogs();
    
    /**
     * Clean up log files
     */
    Map<String, Object> cleanupLogFiles();
    
    // ==================== MONITORING & ALERTING ====================
    
    /**
     * Get monitoring dashboard data
     */
    Map<String, Object> getMonitoringDashboard();
    
    /**
     * Configure alerts
     */
    Map<String, Object> configureAlerts(Map<String, Object> alertConfig);
    
    /**
     * Get active alerts
     */
    List<Map<String, Object>> getActiveAlerts();
    
    /**
     * Acknowledge alert
     */
    Map<String, Object> acknowledgeAlert(String alertId);
    
    // ==================== BACKUP & RECOVERY ====================
    
    /**
     * Create system backup
     */
    Map<String, Object> createSystemBackup();
    
    /**
     * Verify backup integrity
     */
    Map<String, Object> verifyBackupIntegrity();
    
    /**
     * Test disaster recovery
     */
    Map<String, Object> testDisasterRecovery();
    
    /**
     * Get backup status
     */
    Map<String, Object> getBackupStatus();
    
    // ==================== SCHEDULED MAINTENANCE ====================
    
    /**
     * Run scheduled maintenance
     */
    Map<String, Object> runScheduledMaintenance();
    
    /**
     * Get maintenance schedule
     */
    Map<String, Object> getMaintenanceSchedule();
    
    /**
     * Update maintenance schedule
     */
    Map<String, Object> updateMaintenanceSchedule(Map<String, Object> schedule);
    
    /**
     * Get maintenance history
     */
    List<Map<String, Object>> getMaintenanceHistory(int limit);
    
    // ==================== AI LEARNING ====================
    
    /**
     * Learn from system patterns
     */
    Map<String, Object> learnFromPatterns();
    
    /**
     * Predict potential issues
     */
    Map<String, Object> predictPotentialIssues();
    
    /**
     * Get AI recommendations
     */
    List<Map<String, Object>> getAIRecommendations();
    
    /**
     * Get auto-fix statistics
     */
    Map<String, Object> getAutoFixStatistics();
}