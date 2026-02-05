package in.main.service;

import java.util.List;
import java.util.Map;

public interface InventoryAIService {
    Map<Long, Integer> predictDemand(List<Map<String, Object>> historicalData);
    Map<String, Object> optimizeInventory(List<Map<String, Object>> inventoryData);
    Map<String, Object> analyzeSalesPatterns(List<Map<String, Object>> salesData);
    Map<Long, Integer> suggestOptimalStockLevels(List<Map<String, Object>> productData);
}
