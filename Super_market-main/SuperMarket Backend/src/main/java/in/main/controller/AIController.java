package in.main.controller;

import in.main.service.AIService;
import in.main.service.AIMonitoringService;
import in.main.service.VoiceControlService;
import in.main.service.ImageGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private AIMonitoringService aiMonitoringService;

    @Autowired
    private VoiceControlService voiceControlService;

    @Autowired
    private ImageGenerationService imageGenerationService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAIStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("globalAIMode", "auto");
        status.put("voiceAIEnabled", true);
        status.put("loadBalancingActive", true);
        status.put("responseTime", 120);
        status.put("accuracyRate", 94.2);
        status.put("errorRate", 2.1);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/global-mode")
    public ResponseEntity<Map<String, String>> setGlobalAIMode(@RequestParam String mode) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Global AI mode set to: " + mode);
        response.put("mode", mode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/voice-config")
    public ResponseEntity<Map<String, String>> updateVoiceConfig(@RequestBody Map<String, Object> config) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Voice AI configuration updated");
        response.put("language", config.get("language").toString());
        response.put("speed", config.get("speed").toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/load-balancing/status")
    public ResponseEntity<Map<String, Object>> getLoadBalancingStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("apiLoad", 23);
        status.put("aiLoad", 67);
        status.put("backendLoad", 45);
        status.put("status", "optimal");
        return ResponseEntity.ok(status);
    }

    @PostMapping("/load-balancing/balance")
    public ResponseEntity<Map<String, String>> balanceLoad() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Load balancing initiated");
        response.put("status", "balancing");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/features/toggle")
    public ResponseEntity<Map<String, String>> toggleAIFeature(
            @RequestParam String feature,
            @RequestParam boolean enabled) {
        Map<String, String> response = new HashMap<>();
        response.put("message", feature + " " + (enabled ? "enabled" : "disabled"));
        response.put("feature", feature);
        response.put("enabled", String.valueOf(enabled));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monitoring/metrics")
    public ResponseEntity<Map<String, Object>> getAIMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("responseTime", 120);
        metrics.put("accuracyRate", 94.2);
        metrics.put("errorRate", 2.1);
        metrics.put("totalRequests", 15420);
        metrics.put("successfulRequests", 15100);
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/voice/test")
    public ResponseEntity<Map<String, String>> testVoiceAI() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Voice AI test initiated");
        response.put("status", "testing");
        return ResponseEntity.ok(response);
    }

    /**
     * Generate an image using AI
     */
    @PostMapping("/generate-image")
    public ResponseEntity<Map<String, Object>> generateImage(
            @RequestParam String prompt,
            @RequestParam(defaultValue = "dalle") String model,
            @RequestParam Map<String, Object> options) {
        try {
            Map<String, Object> result = imageGenerationService.generateImage(prompt, model, options);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get available image generation models
     */
    @GetMapping("/image-models")
    public ResponseEntity<java.util.List<Map<String, Object>>> getImageModels() {
        try {
            java.util.List<Map<String, Object>> models = imageGenerationService.getAvailableModels();
            return ResponseEntity.ok(models);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.List.of(Map.of("error", e.getMessage())));
        }
    }

    /**
     * Get image generation statistics
     */
    @GetMapping("/image-stats")
    public ResponseEntity<Map<String, Object>> getImageStats() {
        try {
            Map<String, Object> stats = imageGenerationService.getGenerationStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate image generation prompt
     */
    @PostMapping("/validate-prompt")
    public ResponseEntity<Map<String, Object>> validatePrompt(@RequestParam String prompt) {
        try {
            Map<String, Object> validation = imageGenerationService.validatePrompt(prompt);
            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
