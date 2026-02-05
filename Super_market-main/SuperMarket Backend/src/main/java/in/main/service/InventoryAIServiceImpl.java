package in.main.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Service Implementation for inventory management
 */
@Service
public class InventoryAIServiceImpl implements InventoryAIService {

    @Override
    public Map<Long, Integer> predictDemand(List<Map<String, Object>> historicalData) {
        Map<Long, Integer> predictions = new HashMap<>();

        // Simple demand prediction based on moving average
        Map<Long, List<Integer>> productSales = new HashMap<>();

        // Group sales by product
        for (Map<String, Object> data : historicalData) {
            Long productId = ((Number) data.get("productId")).longValue();
            Integer quantity = ((Number) data.get("quantity")).intValue();

            productSales.computeIfAbsent(productId, k -> new ArrayList<>()).add(quantity);
        }

        // Calculate predictions using simple moving average
        for (Map.Entry<Long, List<Integer>> entry : productSales.entrySet()) {
            Long productId = entry.getKey();
            List<Integer> sales = entry.getValue();

            if (sales.size() >= 3) {
                // Use last 3 periods for prediction
                int recentSales = sales.subList(Math.max(0, sales.size() - 3), sales.size())
                    .stream().mapToInt(Integer::intValue).sum();
                int predictedDemand = recentSales / 3;

                // Add 10% buffer for safety
                predictedDemand = (int) (predictedDemand * 1.1);
                predictions.put(productId, Math.max(predictedDemand, 1));
            } else {
                // For new products, predict based on average sales
                int avgSales = sales.stream().mapToInt(Integer::intValue).sum() / sales.size();
                predictions.put(productId, Math.max(avgSales, 1));
            }
        }

        return predictions;
    }

    @Override
    public Map<String, Object> optimizeInventory(List<Map<String, Object>> inventoryData) {
        Map<String, Object> optimization = new HashMap<>();

        List<Map<String, Object>> reorderRecommendations = new ArrayList<>();
        List<Map<String, Object>> overstockItems = new ArrayList<>();
        Map<String, Double> categoryTurnover = new HashMap<>();

        for (Map<String, Object> item : inventoryData) {
            Integer currentStock = ((Number) item.get("quantity")).intValue();
            Integer minStock = ((Number) item.get("minStock")).intValue();
            Integer soldLastMonth = ((Number) item.getOrDefault("soldLastMonth", 0)).intValue();
            String category = (String) item.get("category");
            Long productId = ((Number) item.get("id")).longValue();
            String productName = (String) item.get("name");

            // Calculate turnover ratio
            double turnover = soldLastMonth > 0 ? (double) soldLastMonth / currentStock : 0.0;
            categoryTurnover.merge(category, turnover, Double::sum);

            // Reorder recommendations
            if (currentStock <= minStock) {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("productId", productId);
                recommendation.put("productName", productName);
                recommendation.put("currentStock", currentStock);
                recommendation.put("suggestedReorder", Math.max(soldLastMonth / 30 * 7, minStock * 2)); // Weekly demand or 2x min stock
                recommendation.put("priority", currentStock == 0 ? "CRITICAL" : "HIGH");
                reorderRecommendations.add(recommendation);
            }

            // Overstock detection
            if (currentStock > soldLastMonth * 3 && soldLastMonth > 0) {
                Map<String, Object> overstock = new HashMap<>();
                overstock.put("productId", productId);
                overstock.put("productName", productName);
                overstock.put("currentStock", currentStock);
                overstock.put("monthlySales", soldLastMonth);
                overstock.put("suggestedReduction", currentStock - (soldLastMonth * 2));
                overstockItems.add(overstock);
            }
        }

        optimization.put("reorderRecommendations", reorderRecommendations);
        optimization.put("overstockItems", overstockItems);
        optimization.put("categoryTurnover", categoryTurnover);
        optimization.put("totalReorderItems", reorderRecommendations.size());
        optimization.put("totalOverstockItems", overstockItems.size());

        return optimization;
    }

    @Override
    public Map<String, Object> analyzeSalesPatterns(List<Map<String, Object>> salesData) {
        Map<String, Object> analysis = new HashMap<>();

        // Analyze sales by day of week
        Map<String, Integer> salesByDay = new HashMap<>();
        Map<String, Integer> salesByHour = new HashMap<>();

        for (Map<String, Object> sale : salesData) {
            // Assuming date format includes day/hour info
            String dayOfWeek = (String) sale.getOrDefault("dayOfWeek", "Unknown");
            String hour = String.valueOf(sale.getOrDefault("hour", "Unknown"));
            Integer quantity = ((Number) sale.get("quantity")).intValue();

            salesByDay.merge(dayOfWeek, quantity, Integer::sum);
            salesByHour.merge(hour, quantity, Integer::sum);
        }

        // Find peak days and hours
        String peakDay = salesByDay.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Unknown");

        String peakHour = salesByHour.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Unknown");

        analysis.put("peakSalesDay", peakDay);
        analysis.put("peakSalesHour", peakHour);
        analysis.put("salesByDay", salesByDay);
        analysis.put("salesByHour", salesByHour);

        return analysis;
    }

    @Override
    public Map<Long, Integer> suggestOptimalStockLevels(List<Map<String, Object>> productData) {
        Map<Long, Integer> suggestions = new HashMap<>();

        for (Map<String, Object> product : productData) {
            Long productId = ((Number) product.get("id")).longValue();
            Integer avgDailySales = ((Number) product.getOrDefault("avgDailySales", 1)).intValue();
            Integer leadTimeDays = ((Number) product.getOrDefault("leadTimeDays", 7)).intValue();
            Integer safetyStockDays = ((Number) product.getOrDefault("safetyStockDays", 3)).intValue();

            // Calculate optimal stock: (avg daily sales * lead time) + (avg daily sales * safety stock)
            int optimalStock = (avgDailySales * leadTimeDays) + (avgDailySales * safetyStockDays);
            suggestions.put(productId, Math.max(optimalStock, 1));
        }

        return suggestions;
    }
}
