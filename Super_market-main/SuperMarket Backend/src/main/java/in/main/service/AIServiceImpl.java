package in.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.entities.Product;
import in.main.entities.Ticket;
import in.main.repository.ProductRepository;
import in.main.repository.TicketRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Service Implementation for automated issue resolution
 */
@Service
public class AIServiceImpl implements AIService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private InventoryAIService inventoryAIService;

    @Autowired
    private TicketAIService ticketAIService;

    @Override
    public Map<String, Object> analyzeSystemHealth() {
        Map<String, Object> healthReport = new HashMap<>();

        // Check inventory health
        List<Product> lowStockProducts = productRepository.findByUserIdAndQuantityLessThan(1L, 10); // Assuming userId 1 for demo
        healthReport.put("lowStockProducts", lowStockProducts.size());
        healthReport.put("criticalStockProducts", lowStockProducts.stream()
            .filter(p -> p.getQuantity() <= p.getMinStock())
            .count());

        // Check ticket health
        long unresolvedTickets = ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
            .filter(t -> t.getStatus() != Ticket.TicketStatus.RESOLVED && t.getStatus() != Ticket.TicketStatus.CLOSED)
            .count();
        healthReport.put("unresolvedTickets", unresolvedTickets);

        // Overall health score (0-100)
        int healthScore = calculateHealthScore(lowStockProducts.size(), (int)unresolvedTickets);
        healthReport.put("healthScore", healthScore);

        // AI recommendations
        List<String> recommendations = generateRecommendations(healthScore, lowStockProducts, (int)unresolvedTickets);
        healthReport.put("recommendations", recommendations);

        return healthReport;
    }

    @Override
    public List<String> detectOrderAnomalies(List<Map<String, Object>> orderData) {
        List<String> anomalies = new ArrayList<>();

        // Simple anomaly detection based on statistical analysis
        if (orderData.size() < 2) return anomalies;

        // Calculate average order value
        double avgOrderValue = orderData.stream()
            .mapToDouble(order -> ((Number) order.get("total")).doubleValue())
            .average()
            .orElse(0.0);

        // Detect unusually large orders
        for (Map<String, Object> order : orderData) {
            double orderValue = ((Number) order.get("total")).doubleValue();
            if (orderValue > avgOrderValue * 3) {
                anomalies.add("Unusually large order detected: Order #" + order.get("id") + " ($" + orderValue + ")");
            }
        }

        // Detect bulk quantity orders
        for (Map<String, Object> order : orderData) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) order.get("items");
            if (items != null) {
                for (Map<String, Object> item : items) {
                    int quantity = ((Number) item.get("quantity")).intValue();
                    if (quantity > 100) {
                        anomalies.add("Bulk quantity order detected: " + quantity + " units of " + item.get("productName"));
                    }
                }
            }
        }

        return anomalies;
    }

    @Override
    public Map<Long, Integer> predictProductDemand(List<Map<String, Object>> historicalData) {
        return inventoryAIService.predictDemand(historicalData);
    }

    @Override
    public String autoResolveTicket(String ticketSubject, String ticketDescription) {
        return ticketAIService.autoResolve(ticketSubject, ticketDescription);
    }

    @Override
    public List<Map<String, Object>> generateSmartNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        // Low stock notifications
        List<Product> lowStockProducts = productRepository.findByUserIdAndQuantityLessThan(1L, 10);
        for (Product product : lowStockProducts) {
            if (product.getQuantity() <= product.getMinStock()) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "CRITICAL_STOCK");
                notification.put("title", "Critical Stock Alert");
                notification.put("message", product.getName() + " is at critical stock level (" + product.getQuantity() + " remaining)");
                notification.put("priority", "HIGH");
                notification.put("actionRequired", "Reorder immediately");
                notifications.add(notification);
            } else {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "LOW_STOCK");
                notification.put("title", "Low Stock Warning");
                notification.put("message", product.getName() + " is running low (" + product.getQuantity() + " remaining)");
                notification.put("priority", "MEDIUM");
                notification.put("actionRequired", "Consider reordering");
                notifications.add(notification);
            }
        }

        // System health notifications
        Map<String, Object> health = analyzeSystemHealth();
        int healthScore = (Integer) health.get("healthScore");
        if (healthScore < 70) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "SYSTEM_HEALTH");
            notification.put("title", "System Health Alert");
            notification.put("message", "System health score is " + healthScore + "/100. Review recommendations.");
            notification.put("priority", "HIGH");
            notification.put("actionRequired", "Check system recommendations");
            notifications.add(notification);
        }

        return notifications;
    }

    @Override
    public Map<String, Object> optimizeInventory(List<Map<String, Object>> inventoryData) {
        return inventoryAIService.optimizeInventory(inventoryData);
    }

    private int calculateHealthScore(int lowStockCount, int unresolvedTickets) {
        // Simple health calculation
        int baseScore = 100;
        baseScore -= Math.min(lowStockCount * 5, 30); // Max 30 points deduction for stock issues
        baseScore -= Math.min(unresolvedTickets * 2, 20); // Max 20 points deduction for tickets
        return Math.max(baseScore, 0);
    }

    private List<String> generateRecommendations(int healthScore, List<Product> lowStockProducts, int unresolvedTickets) {
        List<String> recommendations = new ArrayList<>();

        if (healthScore < 50) {
            recommendations.add("CRITICAL: System health is poor. Immediate attention required.");
        }

        if (!lowStockProducts.isEmpty()) {
            recommendations.add("Restock " + lowStockProducts.size() + " products that are running low.");
            List<String> criticalProducts = lowStockProducts.stream()
                .filter(p -> p.getQuantity() <= p.getMinStock())
                .map(Product::getName)
                .collect(Collectors.toList());
            if (!criticalProducts.isEmpty()) {
                recommendations.add("URGENT: Restock critical products: " + String.join(", ", criticalProducts));
            }
        }

        if (unresolvedTickets > 5) {
            recommendations.add("Address " + unresolvedTickets + " unresolved support tickets.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("System is running optimally. No immediate actions required.");
        }

        return recommendations;
    }
}
