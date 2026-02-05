package in.main.service;

import java.util.List;
import java.util.Map;

public interface AdvancedAIService {
    Map<Long, Double> predictDemandAdvanced(List<Map<String, Object>> historicalData);
    List<Map<String, Object>> detectAdvancedAnomalies(List<Map<String, Object>> data);

    Map<String, Object> analyzeCustomerBehavior(List<Map<String, Object>> customerData);
    Map<String, Object> predictSystemMaintenance(List<Map<String, Object>> systemMetrics);
    Map<String, Object> analyzeTicketSentiment(List<Map<String, Object>> ticketData);
    List<Map<String, Object>> detectFraudulentActivity(List<Map<String, Object>> transactionData);
    Map<Long, Double> optimizePricing(List<Map<String, Object>> productData, List<Map<String, Object>> marketData);
    Map<String, Object> generateAIInsights(List<Map<String, Object>> systemData);
}
