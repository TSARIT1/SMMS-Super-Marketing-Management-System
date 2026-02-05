package in.main.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_action_type", columnList = "actionType"),
    @Index(name = "idx_entity_type", columnList = "entityType"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_status", columnList = "status")
})
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Who performed the action
    @Column
    private Long userId;
    
    @Column(length = 100)
    private String userName;
    
    @Column(length = 50)
    private String userRole; // USER, ADMIN, SUPER_ADMIN
    
    // What action was performed
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActionType actionType;
    
    // What entity was affected
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EntityType entityType;
    
    @Column
    private Long entityId; // ID of the affected entity
    
    @Column(columnDefinition = "TEXT")
    private String actionDescription;
    
    // Request details
    @Column(length = 45)
    private String ipAddress;
    
    @Column(length = 500)
    private String userAgent;
    
    @Column(length = 500)
    private String requestUrl;
    
    @Column(length = 20)
    private String httpMethod;
    
    // Result
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActionStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    // Additional data (JSON format for flexibility)
    @Column(columnDefinition = "TEXT")
    private String additionalData;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    // Enums
    public enum ActionType {
        // Authentication
        LOGIN, LOGOUT, REGISTER, PASSWORD_RESET, PASSWORD_CHANGE,
        
        // User Management
        USER_CREATE, USER_UPDATE, USER_DELETE, USER_VIEW,
        ACCOUNT_FREEZE, ACCOUNT_UNFREEZE, ACCOUNT_SUSPEND,
        
        // Product/Inventory
        PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE, PRODUCT_VIEW,
        INVENTORY_UPDATE, INVENTORY_RESTOCK,
        
        // Orders
        ORDER_CREATE, ORDER_UPDATE, ORDER_DELETE, ORDER_VIEW,
        
        // Tickets
        TICKET_CREATE, TICKET_UPDATE, TICKET_DELETE, TICKET_VIEW,
        TICKET_RESPOND, TICKET_STATUS_CHANGE,
        
        // Reports
        REPORT_GENERATE, REPORT_VIEW, REPORT_DOWNLOAD,
        AUDIT_REPORT_GENERATE, AUDIT_REPORT_VIEW,
        
        // Settings
        SETTINGS_UPDATE, CONFIG_CHANGE,
        
        // Subscription
        SUBSCRIPTION_CREATE, SUBSCRIPTION_UPDATE, SUBSCRIPTION_CANCEL,
        PLAN_CREATE, PLAN_UPDATE, PLAN_DELETE,
        PAYMENT_SUCCESS, PAYMENT_FAILED,
        
        // System
        SYSTEM_BACKUP, SYSTEM_RESTORE, DATA_EXPORT, DATA_IMPORT
    }
    
    public enum EntityType {
        USER, ADMIN, PRODUCT, ORDER, TICKET, 
        REPORT, SUBSCRIPTION, SUBSCRIPTION_PLAN, PAYMENT, INVENTORY,
        SYSTEM, SETTINGS, AUTH
    }
    
    public enum ActionStatus {
        SUCCESS, FAILED, PENDING
    }
    
    // Constructors
    public AuditLog() {
        this.timestamp = LocalDateTime.now();
        this.status = ActionStatus.SUCCESS;
    }
    
    public AuditLog(Long userId, String userName, String userRole, 
                   ActionType actionType, EntityType entityType, 
                   String actionDescription) {
        this();
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.actionType = actionType;
        this.entityType = entityType;
        this.actionDescription = actionDescription;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getUserRole() {
        return userRole;
    }
    
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
    
    public ActionType getActionType() {
        return actionType;
    }
    
    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }
    
    public EntityType getEntityType() {
        return entityType;
    }
    
    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }
    
    public Long getEntityId() {
        return entityId;
    }
    
    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }
    
    public String getActionDescription() {
        return actionDescription;
    }
    
    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getRequestUrl() {
        return requestUrl;
    }
    
    public void setRequestUrl(String requestUrl) {
        this.requestUrl = requestUrl;
    }
    
    public String getHttpMethod() {
        return httpMethod;
    }
    
    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }
    
    public ActionStatus getStatus() {
        return status;
    }
    
    public void setStatus(ActionStatus status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getAdditionalData() {
        return additionalData;
    }
    
    public void setAdditionalData(String additionalData) {
        this.additionalData = additionalData;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
