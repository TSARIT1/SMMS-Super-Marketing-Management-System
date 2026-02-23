package in.main.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.service.AISalesMarketingService;

@RestController
@RequestMapping("/api/ai/sales-marketing")
public class AISalesMarketingController {

    @Autowired
    private AISalesMarketingService salesMarketingService;

    @GetMapping("/dashboard/sales")
    public ResponseEntity<Map<String, Object>> getSalesDashboard() {
        return ResponseEntity.ok(salesMarketingService.getSalesDashboard());
    }

    @GetMapping("/dashboard/marketing")
    public ResponseEntity<Map<String, Object>> getMarketingDashboard() {
        return ResponseEntity.ok(salesMarketingService.getMarketingDashboard());
    }

    @GetMapping("/dashboard/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueDashboard() {
        return ResponseEntity.ok(salesMarketingService.getRevenueDashboard());
    }

    @GetMapping("/dashboard/executive-summary")
    public ResponseEntity<Map<String, Object>> getExecutiveSummary() {
        return ResponseEntity.ok(salesMarketingService.generateExecutiveSummary());
    }

    @PostMapping("/leads/generate")
    public ResponseEntity<Map<String, Object>> generateLeads(@RequestBody Map<String, Object> criteria) {
        return ResponseEntity.ok(salesMarketingService.generateLeads(criteria));
    }

    @GetMapping("/leads/hot")
    public ResponseEntity<List<Map<String, Object>>> getHotLeads() {
        return ResponseEntity.ok(salesMarketingService.getHotLeads());
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(salesMarketingService.qualifyLead(leadId));
    }

    @PostMapping("/leads/{leadId}/nurture")
    public ResponseEntity<Map<String, Object>> nurtureLead(
            @PathVariable Long leadId,
            @RequestParam String campaignType) {
        return ResponseEntity.ok(salesMarketingService.nurtureLead(leadId, campaignType));
    }

    @GetMapping("/forecast/{days}")
    public ResponseEntity<Map<String, Object>> getSalesForecast(@PathVariable int days) {
        return ResponseEntity.ok(salesMarketingService.predictSalesForecast(days));
    }

    @GetMapping("/report/{period}")
    public ResponseEntity<Map<String, Object>> getSalesReport(@PathVariable String period) {
        return ResponseEntity.ok(salesMarketingService.generateSalesReport(period));
    }

    @GetMapping("/users/{userId}/upsell")
    public ResponseEntity<Map<String, Object>> getUpsellOpportunities(@PathVariable Long userId) {
        return ResponseEntity.ok(salesMarketingService.identifyUpsellOpportunities(userId));
    }

    @GetMapping("/users/{userId}/churn-risk")
    public ResponseEntity<Map<String, Object>> getChurnRisk(@PathVariable Long userId) {
        return ResponseEntity.ok(salesMarketingService.predictChurnRisk(userId));
    }

    @GetMapping("/users/{userId}/clv")
    public ResponseEntity<Map<String, Object>> getCustomerLifetimeValue(@PathVariable Long userId) {
        return ResponseEntity.ok(salesMarketingService.calculateCustomerLifetimeValue(userId));
    }

    @GetMapping("/global-markets")
    public ResponseEntity<Map<String, Object>> analyzeGlobalMarkets() {
        return ResponseEntity.ok(salesMarketingService.analyzeGlobalMarkets());
    }

    @GetMapping("/regional-sales/{region}")
    public ResponseEntity<Map<String, Object>> getRegionalSalesData(@PathVariable String region) {
        return ResponseEntity.ok(salesMarketingService.getRegionalSalesData(region));
    }

    @PostMapping("/campaigns/sales")
    public ResponseEntity<Map<String, Object>> createSalesCampaign(@RequestBody Map<String, Object> campaignData) {
        return ResponseEntity.ok(salesMarketingService.createSalesCampaign(campaignData));
    }

    @PostMapping("/campaigns/marketing")
    public ResponseEntity<Map<String, Object>> createMarketingCampaign(@RequestBody Map<String, Object> campaignData) {
        return ResponseEntity.ok(salesMarketingService.createMarketingCampaign(campaignData));
    }

    @GetMapping("/campaigns/{campaignId}/performance")
    public ResponseEntity<Map<String, Object>> getCampaignPerformance(@PathVariable Long campaignId) {
        return ResponseEntity.ok(salesMarketingService.analyzeCampaignPerformance(campaignId));
    }

    @PostMapping("/content/generate")
    public ResponseEntity<Map<String, Object>> generateMarketingContent(
            @RequestParam String contentType,
            @RequestBody Map<String, Object> context) {
        return ResponseEntity.ok(salesMarketingService.generateMarketingContent(contentType, context));
    }

    @PostMapping("/ad-spending/optimize")
    public ResponseEntity<Map<String, Object>> optimizeAdSpending(@RequestBody Map<String, Object> budgetData) {
        return ResponseEntity.ok(salesMarketingService.optimizeAdSpending(budgetData));
    }

    @GetMapping("/marketing-insights")
    public ResponseEntity<Map<String, Object>> getMarketingInsights() {
        return ResponseEntity.ok(salesMarketingService.getMarketingInsights());
    }

    @GetMapping("/revenue-streams")
    public ResponseEntity<Map<String, Object>> analyzeRevenueStreams() {
        return ResponseEntity.ok(salesMarketingService.analyzeRevenueStreams());
    }

    @GetMapping("/subscription-pricing/optimize")
    public ResponseEntity<Map<String, Object>> optimizeSubscriptionPricing() {
        return ResponseEntity.ok(salesMarketingService.optimizeSubscriptionPricing());
    }

    @GetMapping("/users/{userId}/retention-strategy")
    public ResponseEntity<Map<String, Object>> getRetentionStrategy(@PathVariable Long userId) {
        return ResponseEntity.ok(salesMarketingService.generateRetentionStrategy(userId));
    }
}