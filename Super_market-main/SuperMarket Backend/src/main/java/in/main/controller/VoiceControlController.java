package in.main.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.service.AIService;
import in.main.service.VoiceControlService;

/**
 * Voice Control Controller for user voice commands
 */
@RestController
@RequestMapping("/api/voice-control")
public class VoiceControlController {

    @Autowired
    private VoiceControlService voiceControlService;

    @Autowired
    private AIService aiService;

    /**
     * Process voice command from user
     */
    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> processVoiceCommand(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String command = request.get("command");
        if (command == null || command.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Voice command is required"));
        }

        try {
            // Process the voice command
            String response = voiceControlService.processVoiceCommand(command);

            // If it's a shopping-related command, enhance with AI
            if (command.toLowerCase().contains("add") || command.toLowerCase().contains("search") ||
                command.toLowerCase().contains("show") || command.toLowerCase().contains("cart")) {
                response = enhanceShoppingResponse(response, command);
            }

            return ResponseEntity.ok(Map.of(
                "response", response,
                "command", command,
                "timestamp", java.time.LocalDateTime.now()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to process voice command",
                "details", e.getMessage()
            ));
        }
    }

    /**
     * Get available voice commands
     */
    @GetMapping("/commands")
    public ResponseEntity<Map<String, Object>> getAvailableCommands() {
        return ResponseEntity.ok(Map.of(
            "commands", voiceControlService.getAvailableCommands(),
            "examples", java.util.Arrays.asList(
                "Add apple to cart",
                "Show products",
                "Search for milk",
                "View cart",
                "Checkout",
                "Help"
            )
        ));
    }

    /**
     * Simulate voice command (for testing without speech recognition)
     */
    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulateVoiceCommand(
            @RequestBody Map<String, String> request) {

        String command = request.get("command");
        if (command == null || command.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Command is required"));
        }

        String response = voiceControlService.simulateVoiceCommand(command);
        String enhancedResponse = enhanceShoppingResponse(response, command);

        return ResponseEntity.ok(Map.of(
            "response", enhancedResponse,
            "originalCommand", command,
            "timestamp", java.time.LocalDateTime.now()
        ));
    }

    /**
     * Get voice control status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getVoiceStatus() {
        Map<String, Object> status = voiceControlService.getVoiceStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * Enhance shopping-related responses with AI
     */
    private String enhanceShoppingResponse(String baseResponse, String command) {
        String lowerCommand = command.toLowerCase();

        // If it's a product search, add AI recommendations
        if (lowerCommand.contains("search") || lowerCommand.contains("show")) {
            try {
                // Get system health to see if there are any product recommendations
                Map<String, Object> health = aiService.analyzeSystemHealth();
                @SuppressWarnings("unchecked")
                java.util.List<String> recommendations = (java.util.List<String>) health.get("recommendations");

                if (recommendations != null && !recommendations.isEmpty()) {
                    String aiTip = recommendations.stream()
                        .filter(rec -> rec.toLowerCase().contains("stock") || rec.toLowerCase().contains("product"))
                        .findFirst()
                        .orElse("");

                    if (!aiTip.isEmpty()) {
                        baseResponse += " | AI Tip: " + aiTip;
                    }
                }
            } catch (Exception e) {
                // Ignore AI enhancement errors
            }
        }

        return baseResponse;
    }
}
