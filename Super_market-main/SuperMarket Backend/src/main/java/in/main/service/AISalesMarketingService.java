package in.main.service;

import java.util.List;
import java.util.Map;

/**
 * AI-Powered Sales & Marketing Service
 * Handles automated sales, marketing, lead generation, and revenue optimization
 */
public interface AISalesMarketingService {
    
    // Lead Generation & Management
    Map<String, Object> generateLeads(Map<String, Object> criteria);
    Map<String, Object> qualifyLead(Long leadId);
    Map<String, Object> scoreLead(Long leadId);
    List<Map<String, Object>> getHotLeads();
    Map<String, Object> nurtureLead(Long leadId, String campaignType);
    
    // Sales Automation
    Map<String, Object> createSalesCampaign(Map<String, Object> campaignData);
    Map<String, Object> optimizePricingStrategy(Long productId);
    Map<String, Object> predictSalesForecast(int daysAhead);
    Map<String, Object> generateSalesReport(String period);
    Map<String, Object> identifyUpsellOpportunities(Long userId);
    
    // Marketing Automation
    Map<String, Object> createMarketingCampaign(Map<String, Object> campaignData);
    Map<String, Object> analyzeCampaignPerformance(Long campaignId);
    Map<String, Object> generateMarketingContent(String contentType, Map<String, Object> context);
    Map<String, Object> optimizeAdSpending(Map<String, Object> budgetData);
    Map<String, Object> getMarketingInsights();
    
    // Global Sales
    Map<String, Object> analyzeGlobalMarkets();
    Map<String, Object> getRegionalSalesData(String region);
    Map<String, Object> expandToNewMarket(String region, Map<String, Object> strategy);
    Map<String, Object> localizeContent(String content, String targetLanguage);
    
    // Revenue Optimization
    Map<String, Object> analyzeRevenueStreams();
    Map<String, Object> predictChurnRisk(Long userId);
    Map<String, Object> generateRetentionStrategy(Long userId);
    Map<String, Object> optimizeSubscriptionPricing();
    Map<String, Object> calculateCustomerLifetimeValue(Long userId);
    
    // Analytics & Insights
    Map<String, Object> getSalesDashboard();
    Map<String, Object> getMarketingDashboard();
    Map<String, Object> getRevenueDashboard();
    Map<String, Object> generateExecutiveSummary();
}