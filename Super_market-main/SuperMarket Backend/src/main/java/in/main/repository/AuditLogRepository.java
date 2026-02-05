package in.main.repository;

import in.main.entities.AuditLog;
import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.AuditLog.ActionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Find by user
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    Page<AuditLog> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    // Find by action type
    List<AuditLog> findByActionTypeOrderByTimestampDesc(ActionType actionType);
    Page<AuditLog> findByActionTypeOrderByTimestampDesc(ActionType actionType, Pageable pageable);
    
    // Find by entity type
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(EntityType entityType);
    Page<AuditLog> findByEntityTypeOrderByTimestampDesc(EntityType entityType, Pageable pageable);
    
    // Find by status
    List<AuditLog> findByStatusOrderByTimestampDesc(ActionStatus status);
    
    // Find by date range
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime startDate, LocalDateTime endDate);
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find by user and date range
    List<AuditLog> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
        Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find by action type and date range
    List<AuditLog> findByActionTypeAndTimestampBetweenOrderByTimestampDesc(
        ActionType actionType, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find by entity and entity ID
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(
        EntityType entityType, Long entityId);
    
    // Complex query with multiple filters
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:actionType IS NULL OR a.actionType = :actionType) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:userRole IS NULL OR a.userRole = :userRole) AND " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> findWithFilters(
        @Param("userId") Long userId,
        @Param("actionType") ActionType actionType,
        @Param("entityType") EntityType entityType,
        @Param("status") ActionStatus status,
        @Param("userRole") String userRole,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.timestamp >= :startDate")
    Long countByTimestampAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.status = :status")
    Long countByStatus(@Param("status") ActionStatus status);
    
    @Query("SELECT a.actionType, COUNT(a) FROM AuditLog a " +
           "WHERE a.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY a.actionType")
    List<Object[]> getActionTypeStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a.entityType, COUNT(a) FROM AuditLog a " +
           "WHERE a.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY a.entityType")
    List<Object[]> getEntityTypeStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a.userRole, COUNT(a) FROM AuditLog a " +
           "WHERE a.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY a.userRole")
    List<Object[]> getUserRoleStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Get recent activity
    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentActivity(Pageable pageable);
    
    // Get failed actions
    @Query("SELECT a FROM AuditLog a WHERE a.status = 'FAILED' " +
           "AND a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentFailures(@Param("since") LocalDateTime since);

    // Get all audit logs ordered by timestamp desc
    List<AuditLog> findAllByOrderByTimestampDesc();
}
