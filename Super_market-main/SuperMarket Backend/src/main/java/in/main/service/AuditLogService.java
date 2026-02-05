package in.main.service;

import in.main.entities.AuditLog;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.AuditLog.ActionStatus;
import in.main.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    /**
     * Create a new audit log entry
     */
    @Transactional
    public AuditLog log(Long userId, String userName, String userRole,
                       ActionType actionType, EntityType entityType,
                       String actionDescription) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setUserRole(userRole);
        auditLog.setActionType(actionType);
        auditLog.setEntityType(entityType);
        auditLog.setActionDescription(actionDescription);
        auditLog.setStatus(ActionStatus.SUCCESS);
        
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * Create audit log with entity ID
     */
    @Transactional
    public AuditLog log(Long userId, String userName, String userRole,
                       ActionType actionType, EntityType entityType,
                       Long entityId, String actionDescription) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setUserRole(userRole);
        auditLog.setActionType(actionType);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setActionDescription(actionDescription);
        auditLog.setStatus(ActionStatus.SUCCESS);
        
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * Create audit log with HTTP request details
     */
    @Transactional
    public AuditLog log(Long userId, String userName, String userRole,
                       ActionType actionType, EntityType entityType,
                       String actionDescription, HttpServletRequest request) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setUserRole(userRole);
        auditLog.setActionType(actionType);
        auditLog.setEntityType(entityType);
        auditLog.setActionDescription(actionDescription);
        auditLog.setStatus(ActionStatus.SUCCESS);
        
        // Extract request details
        if (request != null) {
            auditLog.setIpAddress(getClientIpAddress(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
            auditLog.setRequestUrl(request.getRequestURI());
            auditLog.setHttpMethod(request.getMethod());
        }
        
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * Create audit log for failed action
     */
    @Transactional
    public AuditLog logFailure(Long userId, String userName, String userRole,
                              ActionType actionType, EntityType entityType,
                              String actionDescription, String errorMessage) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setUserRole(userRole);
        auditLog.setActionType(actionType);
        auditLog.setEntityType(entityType);
        auditLog.setActionDescription(actionDescription);
        auditLog.setStatus(ActionStatus.FAILED);
        auditLog.setErrorMessage(errorMessage);
        
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * Create audit log with additional data
     */
    @Transactional
    public AuditLog logWithData(Long userId, String userName, String userRole,
                               ActionType actionType, EntityType entityType,
                               String actionDescription, String additionalData) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setUserRole(userRole);
        auditLog.setActionType(actionType);
        auditLog.setEntityType(entityType);
        auditLog.setActionDescription(actionDescription);
        auditLog.setAdditionalData(additionalData);
        auditLog.setStatus(ActionStatus.SUCCESS);
        
        return auditLogRepository.save(auditLog);
    }

    /**
     * Convenience logger for quick system-level logs
     */
    @Transactional
    public AuditLog logAction(String actionCode, String userName, String actionDescription, ActionStatus status) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserName(userName);
        auditLog.setUserRole("SYSTEM");
        try {
            auditLog.setActionType(ActionType.valueOf(actionCode));
        } catch (Exception e) {
            auditLog.setActionType(ActionType.SYSTEM_BACKUP);
        }
        auditLog.setEntityType(EntityType.SYSTEM);
        auditLog.setActionDescription(actionDescription);
        auditLog.setStatus(status != null ? status : ActionStatus.SUCCESS);
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * Get audit logs with filters
     */
    public Page<AuditLog> getAuditLogs(Long userId, ActionType actionType,
                                       EntityType entityType, ActionStatus status,
                                       String userRole, LocalDateTime startDate,
                                       LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findWithFilters(
            userId, actionType, entityType, status, userRole,
            startDate, endDate, pageable);
    }
    
    /**
     * Get user's audit logs
     */
    public Page<AuditLog> getUserAuditLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }
    
    /**
     * Get recent activity
     */
    public List<AuditLog> getRecentActivity(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return auditLogRepository.findRecentActivity(pageable);
    }
    
    /**
     * Get user-specific recent activity
     */
    public List<AuditLog> getUserRecentActivity(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<AuditLog> page = auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        return page.getContent();
    }
    
    /**
     * Get recent failures
     */
    public List<AuditLog> getRecentFailures(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return auditLogRepository.findRecentFailures(since);
    }
    
    /**
     * Get statistics
     */
    public Map<String, Object> getStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Total logs
        List<AuditLog> logs = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
            startDate, endDate);
        stats.put("totalLogs", logs.size());
        
        // Success/Failed counts
        long successCount = logs.stream()
            .filter(log -> log.getStatus() == ActionStatus.SUCCESS)
            .count();
        long failedCount = logs.stream()
            .filter(log -> log.getStatus() == ActionStatus.FAILED)
            .count();
        
        stats.put("successCount", successCount);
        stats.put("failedCount", failedCount);
        
        // Action type statistics
        List<Object[]> actionTypeStats = auditLogRepository.getActionTypeStatistics(
            startDate, endDate);
        stats.put("actionTypeStatistics", actionTypeStats);
        
        // Entity type statistics
        List<Object[]> entityTypeStats = auditLogRepository.getEntityTypeStatistics(
            startDate, endDate);
        stats.put("entityTypeStatistics", entityTypeStats);
        
        // User role statistics
        List<Object[]> userRoleStats = auditLogRepository.getUserRoleStatistics(
            startDate, endDate);
        stats.put("userRoleStatistics", userRoleStats);
        
        return stats;
    }
    
    /**
     * Get user-specific statistics
     */
    public Map<String, Object> getUserStatistics(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get user-specific logs
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<AuditLog> userLogsPage = auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        List<AuditLog> logs = userLogsPage.getContent().stream()
            .filter(log -> !log.getTimestamp().isBefore(startDate) && !log.getTimestamp().isAfter(endDate))
            .toList();
        
        stats.put("totalLogs", logs.size());
        
        // Success/Failed counts
        long successCount = logs.stream()
            .filter(log -> log.getStatus() == ActionStatus.SUCCESS)
            .count();
        long failedCount = logs.stream()
            .filter(log -> log.getStatus() == ActionStatus.FAILED)
            .count();
        
        stats.put("successCount", successCount);
        stats.put("failedCount", failedCount);
        
        // Action type breakdown
        Map<ActionType, Long> actionTypeCounts = logs.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                AuditLog::getActionType,
                java.util.stream.Collectors.counting()
            ));
        stats.put("actionTypeStatistics", actionTypeCounts);
        
        // Entity type breakdown
        Map<EntityType, Long> entityTypeCounts = logs.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                AuditLog::getEntityType,
                java.util.stream.Collectors.counting()
            ));
        stats.put("entityTypeStatistics", entityTypeCounts);
        
        return stats;
    }
    
    /**
     * Get entity audit trail
     */
    public List<AuditLog> getEntityAuditTrail(EntityType entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(
            entityType, entityId);
    }
    
    /**
     * Get all audit logs (for admin)
     */
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Get first IP if multiple
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}
