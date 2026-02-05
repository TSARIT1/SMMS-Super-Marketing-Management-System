package in.main.service;

import in.main.entities.Product;
import in.main.entities.Ticket;
import in.main.repository.ProductRepository;
import in.main.repository.TicketRepository;
import in.main.entities.AuditLog.ActionStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * AI Monitoring Service for continuous system monitoring and automatic repair
 */
@Service
public class AIMonitoringService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private InventoryAIService inventoryAIService;

    @Autowired
    private AuditLogService auditLogService;

    // Monitoring state
    private final Map<String, Object> systemMetrics = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> monitoringHistory = new ArrayList<>();
    private final Map<String, LocalDateTime> lastRepairActions = new ConcurrentHashMap<>();

    // Monitoring thresholds
    private static final int LOW_STOCK_THRESHOLD = 20;
    private static final int MAX_UNRESOLVED_TICKETS = 10;
    private static final int AUTO_REPAIR_COOLDOWN_MINUTES = 30;

    /**
     * Scheduled health monitoring - runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void performHealthMonitoring() {
        try {
            Map<String, Object> healthReport = aiService.analyzeSystemHealth();
            systemMetrics.put("lastHealthCheck", LocalDateTime.now());
            systemMetrics.put("healthReport", healthReport);

            // Store in history (keep last 100 entries)
            Map<String, Object> historyEntry = new HashMap<>();
            historyEntry.put("timestamp", LocalDateTime.now());
            historyEntry.put("healthReport", healthReport);
            monitoringHistory.add(historyEntry);
            if (monitoringHistory.size() > 100) {
                monitoringHistory.remove(0);
            }

            // Check for issues requiring auto-repair
            checkAndPerformAutoRepair(healthReport);

            // Log monitoring activity
            auditLogService.logAction(
                "SYSTEM_MONITORING",
                "AI Monitoring Service",
                "Health check completed - Score: " + healthReport.get("healthScore"),
                ActionStatus.SUCCESS
            );

        } catch (Exception e) {
            auditLogService.logAction(
                "SYSTEM_MONITORING",
                "AI Monitoring Service",
                "Health check failed: " + e.getMessage(),
                ActionStatus.FAILED
            );
        }
    }

    /**
     * Check and perform automatic repairs for detected issues
     */
    private void checkAndPerformAutoRepair(Map<String, Object> healthReport) {
        int healthScore = (Integer) healthReport.get("healthScore");
        int lowStockProducts = (Integer) healthReport.get("lowStockProducts");
        int unresolvedTickets = (Integer) healthReport.get("unresolvedTickets");

        // Critical health - attempt emergency repairs
        if (healthScore < 30) {
            performEmergencyRepair(healthReport);
        }
        // Low stock auto-restock
        else if (lowStockProducts > 5) {
            performAutoRestock();
        }
        // High ticket volume - auto-escalation
        else if (unresolvedTickets > MAX_UNRESOLVED_TICKETS) {
            performTicketEscalation();
        }
    }

    /**
     * Emergency repair for critical system issues
     */
    private void performEmergencyRepair(Map<String, Object> healthReport) {
        // Check cooldown
        if (isRepairOnCooldown("emergency")) {
            return;
        }

        try {
            auditLogService.logAction(
                "AUTO_REPAIR",
                "Emergency Repair",
                "Initiating emergency system repair - Health Score: " + healthReport.get("healthScore"),
                ActionStatus.PENDING
            );

            // Attempt to fix critical issues
            List<String> repairsPerformed = new ArrayList<>();

            // 1. Auto-restock critical products
            List<Product> criticalProducts = productRepository.findAll().stream()
                .filter(p -> p.getQuantity() <= p.getMinStock())
                .collect(Collectors.toList());

            for (Product product : criticalProducts) {
                int restockAmount = Math.max(product.getMinStock() * 2, 10);
                product.setQuantity(product.getQuantity() + restockAmount);
                productRepository.save(product);
                repairsPerformed.add("Restocked " + product.getName() + " with " + restockAmount + " units");
            }

            // 2. Auto-resolve simple tickets
            List<Ticket> simpleTickets = ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .filter(t -> t.getStatus() != Ticket.TicketStatus.RESOLVED && t.getStatus() != Ticket.TicketStatus.CLOSED)
                .filter(t -> isSimpleTicket(t))
                .limit(5)
                .collect(Collectors.toList());

            for (Ticket ticket : simpleTickets) {
                String resolution = aiService.autoResolveTicket(ticket.getSubject(), ticket.getDescription());
                if (resolution != null && !resolution.isEmpty()) {
                    ticket.setStatus(Ticket.TicketStatus.RESOLVED);
                    ticket.setAdminResponse(resolution);
                    ticket.setResolvedAt(LocalDateTime.now());
                    ticketRepository.save(ticket);
                    repairsPerformed.add("Auto-resolved ticket #" + ticket.getId());
                }
            }

            lastRepairActions.put("emergency", LocalDateTime.now());

            auditLogService.logAction(
                "AUTO_REPAIR",
                "Emergency Repair",
                "Emergency repair completed. Actions: " + String.join(", ", repairsPerformed),
                ActionStatus.SUCCESS
            );

        } catch (Exception e) {
            auditLogService.logAction(
                "AUTO_REPAIR",
                "Emergency Repair",
                "Emergency repair failed: " + e.getMessage(),
                ActionStatus.FAILED
            );
        }
    }

    /**
     * Automatic restocking for low inventory
     */
    private void performAutoRestock() {
        if (isRepairOnCooldown("restock")) {
            return;
        }

        try {
            List<Product> lowStockProducts = productRepository.findAll().stream()
                .filter(p -> p.getQuantity() <= LOW_STOCK_THRESHOLD)
                .collect(Collectors.toList());

            List<String> restockedItems = new ArrayList<>();

            for (Product product : lowStockProducts) {
                // Use AI to predict optimal restock amount
                List<Map<String, Object>> historicalData = getProductHistoricalData(product.getId());
                Map<Long, Integer> predictions = inventoryAIService.predictDemand(historicalData);

                int predictedDemand = predictions.getOrDefault(product.getId(), 10);
                int restockAmount = Math.max(predictedDemand, product.getMinStock() - product.getQuantity() + 5);

                product.setQuantity(product.getQuantity() + restockAmount);
                productRepository.save(product);
                restockedItems.add(product.getName() + " (+" + restockAmount + ")");
            }

            if (!restockedItems.isEmpty()) {
                lastRepairActions.put("restock", LocalDateTime.now());
                auditLogService.logAction(
                    "AUTO_RESTOCK",
                    "Inventory AI",
                    "Auto-restocked products: " + String.join(", ", restockedItems),
                    ActionStatus.SUCCESS
                );
            }

        } catch (Exception e) {
            auditLogService.logAction(
                "AUTO_RESTOCK",
                "Inventory AI",
                "Auto-restock failed: " + e.getMessage(),
                ActionStatus.FAILED
            );
        }
    }

    /**
     * Automatic ticket escalation for high volume
     */
    private void performTicketEscalation() {
        if (isRepairOnCooldown("escalation")) {
            return;
        }

        try {
            List<Ticket> unresolvedTickets = ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .filter(t -> t.getStatus() != Ticket.TicketStatus.RESOLVED && t.getStatus() != Ticket.TicketStatus.CLOSED)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());

            List<String> escalatedTickets = new ArrayList<>();

            for (Ticket ticket : unresolvedTickets) {
                // Escalate high-priority tickets
                if (isHighPriorityTicket(ticket)) {
                    ticket.setPriority(Ticket.TicketPriority.URGENT);
                    ticketRepository.save(ticket);
                    escalatedTickets.add("Ticket #" + ticket.getId() + " escalated to URGENT");
                }
            }

            if (!escalatedTickets.isEmpty()) {
                lastRepairActions.put("escalation", LocalDateTime.now());
                auditLogService.logAction(
                    "AUTO_ESCALATION",
                    "Ticket AI",
                    "Auto-escalated tickets: " + String.join(", ", escalatedTickets),
                    ActionStatus.SUCCESS
                );
            }

        } catch (Exception e) {
            auditLogService.logAction(
                "AUTO_ESCALATION",
                "Ticket AI",
                "Auto-escalation failed: " + e.getMessage(),
                ActionStatus.FAILED
            );
        }
    }

    /**
     * Get current system status
     */
    public Map<String, Object> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("currentMetrics", systemMetrics);
        status.put("monitoringHistory", monitoringHistory.subList(Math.max(0, monitoringHistory.size() - 10), monitoringHistory.size()));
        status.put("lastRepairActions", lastRepairActions);
        status.put("isHealthy", isSystemHealthy());
        return status;
    }

    /**
     * Check if system is currently healthy
     */
    public boolean isSystemHealthy() {
        Map<String, Object> healthReport = (Map<String, Object>) systemMetrics.get("healthReport");
        if (healthReport == null) return true;

        int healthScore = (Integer) healthReport.getOrDefault("healthScore", 100);
        return healthScore >= 70;
    }

    /**
     * Get AI recommendations for manual intervention
     */
    public List<String> getAIRecommendations() {
        Map<String, Object> healthReport = (Map<String, Object>) systemMetrics.get("healthReport");
        if (healthReport == null) return new ArrayList<>();

        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) healthReport.get("recommendations");
        return recommendations != null ? recommendations : new ArrayList<>();
    }

    /**
     * Manually trigger system health check
     */
    public Map<String, Object> triggerHealthCheck() {
        Map<String, Object> healthReport = aiService.analyzeSystemHealth();
        systemMetrics.put("lastHealthCheck", LocalDateTime.now());
        systemMetrics.put("healthReport", healthReport);

        auditLogService.logAction(
            "MANUAL_HEALTH_CHECK",
            "Super Admin",
            "Manual health check triggered - Score: " + healthReport.get("healthScore"),
            ActionStatus.SUCCESS
        );

        return healthReport;
    }

    // Helper methods

    private boolean isRepairOnCooldown(String repairType) {
        LocalDateTime lastAction = lastRepairActions.get(repairType);
        if (lastAction == null) return false;

        return lastAction.isAfter(LocalDateTime.now().minusMinutes(AUTO_REPAIR_COOLDOWN_MINUTES));
    }

    private boolean isSimpleTicket(Ticket ticket) {
        String subject = ticket.getSubject().toLowerCase();
        String description = ticket.getDescription().toLowerCase();

        // Simple tickets that can be auto-resolved
        return subject.contains("password") && description.contains("reset") ||
               subject.contains("login") && description.contains("cannot") ||
               subject.contains("account") && description.contains("lock");
    }

    private boolean isHighPriorityTicket(Ticket ticket) {
        String subject = ticket.getSubject().toLowerCase();
        String description = ticket.getDescription().toLowerCase();

        return subject.contains("error") || subject.contains("fail") ||
               subject.contains("urgent") || subject.contains("critical") ||
               description.contains("not working") || description.contains("broken");
    }

    private List<Map<String, Object>> getProductHistoricalData(Long productId) {
        // Placeholder - in real implementation, this would query order history
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("productId", productId);
            entry.put("quantity", 5 + (int)(Math.random() * 15)); // Random historical data
            entry.put("date", LocalDateTime.now().minusDays(i));
            data.add(entry);
        }
        return data;
    }
}
