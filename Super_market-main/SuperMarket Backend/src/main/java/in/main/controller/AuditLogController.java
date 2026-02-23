package in.main.controller;

import in.main.entities.AuditLog;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.AuditLog.ActionStatus;
import in.main.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082"}, allowCredentials = "true")
public class AuditLogController {
    
    @Autowired
    private AuditLogService auditLogService;
    
    /**
     * Get audit logs with filters
     * GET /api/audit/logs
     * Regular users can only see their own logs (excluding admin/super_admin actions)
     * Admins and Super Admins can see all logs
     */
    @GetMapping("/logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestHeader(value = "requesterId", required = false) Long requesterId,
            @RequestHeader(value = "requesterRole", required = false) String requesterRole) {
        
        try {
            // If requester is a regular USER, force filter to their own data only
            if (requesterId != null && "USER".equals(requesterRole)) {
                userId = requesterId; // Override userId to requester's ID
                // Exclude admin and super admin actions from user view
                if (userRole == null || userRole.isEmpty()) {
                    userRole = "USER"; // Only show USER role logs
                }
            }
            
            // Convert string enums to actual enums
            ActionType actionTypeEnum = actionType != null ? ActionType.valueOf(actionType) : null;
            EntityType entityTypeEnum = entityType != null ? EntityType.valueOf(entityType) : null;
            ActionStatus statusEnum = status != null ? ActionStatus.valueOf(status) : null;
            
            // Set default date range if not provided (last 30 days)
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            Page<AuditLog> logs = auditLogService.getAuditLogs(
                userId, actionTypeEnum, entityTypeEnum, statusEnum, 
                userRole, startDate, endDate, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("logs", logs.getContent());
            response.put("totalPages", logs.getTotalPages());
            response.put("totalElements", logs.getTotalElements());
            response.put("currentPage", logs.getNumber());
            response.put("pageSize", logs.getSize());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid parameter",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve audit logs",
                "message", e.getMessage() != null ? e.getMessage() : "Internal server error"
            ));
        }
    }
    
    /**
     * Get user-specific audit logs
     * GET /api/audit/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAuditLogs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Page<AuditLog> logs = auditLogService.getUserAuditLogs(userId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("logs", logs.getContent());
            response.put("totalPages", logs.getTotalPages());
            response.put("totalElements", logs.getTotalElements());
            response.put("currentPage", logs.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve user audit logs",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get recent activity
     * GET /api/audit/recent
     * Regular users only see their own activity
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentActivity(
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader(value = "requesterId", required = false) Long requesterId,
            @RequestHeader(value = "requesterRole", required = false) String requesterRole) {
        
        try {
            List<AuditLog> recentLogs;
            
            // If requester is a regular USER, only show their logs
            if (requesterId != null && "USER".equals(requesterRole)) {
                recentLogs = auditLogService.getUserRecentActivity(requesterId, limit);
            } else {
                recentLogs = auditLogService.getRecentActivity(limit);
            }
            
            return ResponseEntity.ok(Map.of(
                "logs", recentLogs,
                "count", recentLogs.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve recent activity",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get recent failures
     * GET /api/audit/failures
     */
    @GetMapping("/failures")
    public ResponseEntity<?> getRecentFailures(
            @RequestParam(defaultValue = "24") int hours) {
        
        try {
            List<AuditLog> failures = auditLogService.getRecentFailures(hours);
            
            return ResponseEntity.ok(Map.of(
                "failures", failures,
                "count", failures.size(),
                "timeRange", hours + " hours"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve failures",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get statistics for a date range
     * GET /api/audit/statistics
     * Regular users only see their own statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestHeader(value = "requesterId", required = false) Long requesterId,
            @RequestHeader(value = "requesterRole", required = false) String requesterRole) {
        
        try {
            // Default to last 7 days if not provided
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(7);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            Map<String, Object> statistics;
            
            // If requester is a regular USER, only show their statistics
            if (requesterId != null && "USER".equals(requesterRole)) {
                statistics = auditLogService.getUserStatistics(requesterId, startDate, endDate);
            } else {
                statistics = auditLogService.getStatistics(startDate, endDate);
            }
            
            statistics.put("startDate", startDate);
            statistics.put("endDate", endDate);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve statistics",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get entity audit trail
     * GET /api/audit/entity/{entityType}/{entityId}
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<?> getEntityAuditTrail(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        try {
            EntityType entityTypeEnum = EntityType.valueOf(entityType);
            List<AuditLog> trail = auditLogService.getEntityAuditTrail(entityTypeEnum, entityId);
            
            return ResponseEntity.ok(Map.of(
                "entityType", entityType,
                "entityId", entityId,
                "logs", trail,
                "count", trail.size()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid entity type",
                "message", "Valid types: " + String.join(", ", 
                    java.util.Arrays.stream(EntityType.values())
                        .map(Enum::name)
                        .toArray(String[]::new))
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve entity audit trail",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get available action types
     * GET /api/audit/action-types
     */
    @GetMapping("/action-types")
    public ResponseEntity<?> getActionTypes() {
        try {
            List<String> actionTypes = java.util.Arrays.stream(ActionType.values())
                .map(Enum::name)
                .toList();
            
            return ResponseEntity.ok(Map.of("actionTypes", actionTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve action types",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get available entity types
     * GET /api/audit/entity-types
     */
    @GetMapping("/entity-types")
    public ResponseEntity<?> getEntityTypes() {
        try {
            List<String> entityTypes = java.util.Arrays.stream(EntityType.values())
                .map(Enum::name)
                .toList();
            
            return ResponseEntity.ok(Map.of("entityTypes", entityTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve entity types",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Create manual audit log (for testing or special cases)
     * POST /api/audit/log
     */
    @PostMapping("/log")
    public ResponseEntity<?> createAuditLog(
            @RequestBody Map<String, Object> logData,
            HttpServletRequest request) {
        
        try {
            Long userId = Long.valueOf(logData.get("userId").toString());
            String userName = logData.get("userName").toString();
            String userRole = logData.get("userRole").toString();
            ActionType actionType = ActionType.valueOf(logData.get("actionType").toString());
            EntityType entityType = EntityType.valueOf(logData.get("entityType").toString());
            String description = logData.get("description").toString();
            
            AuditLog log = auditLogService.log(
                userId, userName, userRole, actionType, 
                entityType, description, request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Audit log created successfully",
                "log", log
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to create audit log",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Export audit logs (returns data for CSV/PDF generation)
     * GET /api/audit/export
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType) {
        
        try {
            // Set default date range if not provided (last 30 days)
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            ActionType actionTypeEnum = actionType != null ? ActionType.valueOf(actionType) : null;
            EntityType entityTypeEnum = entityType != null ? EntityType.valueOf(entityType) : null;
            
            // Get all logs without pagination for export
            Page<AuditLog> logs = auditLogService.getAuditLogs(
                userId, actionTypeEnum, entityTypeEnum, null, 
                null, startDate, endDate, 0, 10000);
            
            Map<String, Object> exportData = new HashMap<>();
            exportData.put("logs", logs.getContent());
            exportData.put("totalRecords", logs.getTotalElements());
            exportData.put("startDate", startDate);
            exportData.put("endDate", endDate);
            exportData.put("exportDate", LocalDateTime.now());
            
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to export audit logs",
                "message", e.getMessage()
            ));
        }
    }
}
