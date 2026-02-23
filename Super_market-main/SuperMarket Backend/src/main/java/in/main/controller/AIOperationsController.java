package in.main.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.service.AICodeMaintenanceService;
import in.main.service.AIOperationsMasterService;

/**
 * AI Operations Controller
 * Central API for all AI-powered operations
 */
@RestController
@RequestMapping("/api/ai/operations")
@CrossOrigin(origins = "*")
public class AIOperationsController {

    @Autowired
    private AIOperationsMasterService operationsMasterService;
    
    @Autowired
    private AICodeMaintenanceService codeMaintenanceService;

    // ==================== MASTER CONTROLS ====================
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOperationsStatus() {
        return ResponseEntity.ok(operationsMasterService.getOperationsStatus());
    }
    
    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleAIOperations(@RequestParam boolean enabled) {
        return ResponseEntity.ok(operationsMasterService.toggleAIOperations(enabled));
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAIOperationsDashboard() {
        return ResponseEntity.ok(operationsMasterService.getAIOperationsDashboard());
    }
    
    @PostMapping("/run-all")
    public ResponseEntity<Map<String, Object>> runAllAutomatedTasks() {
        return ResponseEntity.ok(operationsMasterService.runAllAutomatedTasks());
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        return ResponseEntity.ok(operationsMasterService.getSystemHealth());
    }
    
    // ==================== AUTOMATION ====================
    
    @PostMapping("/optimize-all")
    public ResponseEntity<Map<String, Object>> autoOptimizeAll() {
        return ResponseEntity.ok(operationsMasterService.autoOptimizeAll());
    }
    
    @GetMapping("/schedule")
    public ResponseEntity<Map<String, Object>> getAutomationSchedule() {
        return ResponseEntity.ok(operationsMasterService.getAutomationSchedule());
    }
    
    @PostMapping("/schedule")
    public ResponseEntity<Map<String, Object>> updateAutomationSchedule(@RequestBody Map<String, Object> schedule) {
        return ResponseEntity.ok(operationsMasterService.updateAutomationSchedule(schedule));
    }
    
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getAutomationLogs(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(operationsMasterService.getAutomationLogs(limit));
    }
    
    // ==================== DECISION MAKING ====================
    
    @PostMapping("/decision/{area}")
    public ResponseEntity<Map<String, Object>> makeStrategicDecision(
            @PathVariable String area,
            @RequestBody Map<String, Object> context) {
        return ResponseEntity.ok(operationsMasterService.makeStrategicDecision(area, context));
    }
    
    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getAllRecommendations() {
        return ResponseEntity.ok(operationsMasterService.getAllRecommendations());
    }
    
    @PostMapping("/recommendations/{recommendationId}/execute")
    public ResponseEntity<Map<String, Object>> executeRecommendation(@PathVariable String recommendationId) {
        return ResponseEntity.ok(operationsMasterService.executeRecommendation(recommendationId));
    }
    
    // ==================== ANALYTICS ====================
    
    @PostMapping("/impact-analysis")
    public ResponseEntity<Map<String, Object>> analyzeCrossDomainImpact(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(operationsMasterService.analyzeCrossDomainImpact(request.get("action")));
    }
    
    @GetMapping("/resource-allocation")
    public ResponseEntity<Map<String, Object>> optimizeResourceAllocation() {
        return ResponseEntity.ok(operationsMasterService.optimizeResourceAllocation());
    }
    
    @GetMapping("/unified-metrics")
    public ResponseEntity<Map<String, Object>> getUnifiedMetrics() {
        return ResponseEntity.ok(operationsMasterService.getUnifiedMetrics());
    }
    
    // ==================== PREDICTIONS ====================
    
    @GetMapping("/predict/{days}")
    public ResponseEntity<Map<String, Object>> predictTrends(@PathVariable int days) {
        return ResponseEntity.ok(operationsMasterService.predictTrends(days));
    }
    
    @GetMapping("/risks")
    public ResponseEntity<Map<String, Object>> assessRisks() {
        return ResponseEntity.ok(operationsMasterService.assessRisks());
    }
    
    @GetMapping("/contingency-plans")
    public ResponseEntity<Map<String, Object>> generateContingencyPlans() {
        return ResponseEntity.ok(operationsMasterService.generateContingencyPlans());
    }
    
    // ==================== LEARNING ====================
    
    @GetMapping("/learning-insights")
    public ResponseEntity<Map<String, Object>> getLearningInsights() {
        return ResponseEntity.ok(operationsMasterService.getLearningInsights());
    }
    
    @PostMapping("/update-models")
    public ResponseEntity<Map<String, Object>> updateModels() {
        return ResponseEntity.ok(operationsMasterService.updateModels());
    }
    
    @GetMapping("/ai-performance")
    public ResponseEntity<Map<String, Object>> getAIPerformanceMetrics() {
        return ResponseEntity.ok(operationsMasterService.getAIPerformanceMetrics());
    }
    
    // ==================== CODE MAINTENANCE ====================
    
    @GetMapping("/code/analyze")
    public ResponseEntity<Map<String, Object>> analyzeCodebase() {
        return ResponseEntity.ok(codeMaintenanceService.analyzeCodebase());
    }
    
    @GetMapping("/code/bugs/{module}")
    public ResponseEntity<Map<String, Object>> detectBugs(@PathVariable String module) {
        return ResponseEntity.ok(codeMaintenanceService.detectBugs(module));
    }
    
    @GetMapping("/code/quality")
    public ResponseEntity<Map<String, Object>> analyzeCodeQuality() {
        return ResponseEntity.ok(codeMaintenanceService.analyzeCodeQuality());
    }
    
    @GetMapping("/code/security")
    public ResponseEntity<Map<String, Object>> checkSecurityVulnerabilities() {
        return ResponseEntity.ok(codeMaintenanceService.checkSecurityVulnerabilities());
    }
    
    @GetMapping("/code/dependencies")
    public ResponseEntity<Map<String, Object>> analyzeDependencies() {
        return ResponseEntity.ok(codeMaintenanceService.analyzeDependencies());
    }
    
    @PostMapping("/code/auto-fix")
    public ResponseEntity<Map<String, Object>> autoFixIssues(@RequestBody List<String> issueIds) {
        return ResponseEntity.ok(codeMaintenanceService.autoFixIssues(issueIds));
    }
    
    @GetMapping("/code/fix-suggestion/{issueId}")
    public ResponseEntity<Map<String, Object>> generateFixSuggestion(@PathVariable String issueId) {
        return ResponseEntity.ok(codeMaintenanceService.generateFixSuggestion(issueId));
    }
    
    @PostMapping("/code/optimize")
    public ResponseEntity<Map<String, Object>> applyCodeOptimization(@RequestParam String type) {
        return ResponseEntity.ok(codeMaintenanceService.applyCodeOptimization(type));
    }
    
    @PostMapping("/code/refactor")
    public ResponseEntity<Map<String, Object>> refactorCode(
            @RequestParam String filePath,
            @RequestParam String refactoringType) {
        return ResponseEntity.ok(codeMaintenanceService.refactorCode(filePath, refactoringType));
    }
    
    @PostMapping("/code/maintenance")
    public ResponseEntity<Map<String, Object>> runScheduledMaintenance() {
        return ResponseEntity.ok(codeMaintenanceService.runScheduledMaintenance());
    }
    
    @PostMapping("/code/tech-debt-cleanup")
    public ResponseEntity<Map<String, Object>> cleanupTechnicalDebt() {
        return ResponseEntity.ok(codeMaintenanceService.cleanupTechnicalDebt());
    }
    
    @PostMapping("/code/update-dependencies")
    public ResponseEntity<Map<String, Object>> updateDependencies() {
        return ResponseEntity.ok(codeMaintenanceService.updateDependencies());
    }
    
    @GetMapping("/code/documentation/{module}")
    public ResponseEntity<Map<String, Object>> generateDocumentation(@PathVariable String module) {
        return ResponseEntity.ok(codeMaintenanceService.generateDocumentation(module));
    }
    
    @GetMapping("/code/health")
    public ResponseEntity<Map<String, Object>> getCodeHealthMetrics() {
        return ResponseEntity.ok(codeMaintenanceService.getCodeHealthMetrics());
    }
    
    @GetMapping("/code/maintenance-logs")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceLogs(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(codeMaintenanceService.getMaintenanceLogs(limit));
    }
    
    @GetMapping("/code/issues")
    public ResponseEntity<Map<String, Object>> getIssueTracking() {
        return ResponseEntity.ok(codeMaintenanceService.getIssueTracking());
    }
    
    @GetMapping("/code/tech-debt")
    public ResponseEntity<Map<String, Object>> getTechnicalDebtReport() {
        return ResponseEntity.ok(codeMaintenanceService.getTechnicalDebtReport());
    }
    
    @GetMapping("/code/improvements")
    public ResponseEntity<Map<String, Object>> getImprovementSuggestions() {
        return ResponseEntity.ok(codeMaintenanceService.getImprovementSuggestions());
    }
    
    @GetMapping("/code/prioritize-tasks")
    public ResponseEntity<Map<String, Object>> prioritizeMaintenanceTasks() {
        return ResponseEntity.ok(codeMaintenanceService.prioritizeMaintenanceTasks());
    }
    
    @GetMapping("/code/predict-issues")
    public ResponseEntity<Map<String, Object>> predictPotentialIssues() {
        return ResponseEntity.ok(codeMaintenanceService.predictPotentialIssues());
    }
    
    @GetMapping("/code/review/{filePath}")
    public ResponseEntity<Map<String, Object>> generateCodeReviewComments(@PathVariable String filePath) {
        return ResponseEntity.ok(codeMaintenanceService.generateCodeReviewComments(filePath));
    }
}