package in.main.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import in.main.service.AIVoiceAssistantService;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * AI Voice Assistant Controller
 * REST API endpoints for AI-powered voice assistant functionality
 */
@RestController
@RequestMapping("/api/ai-voice")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIVoiceController {

    private static final Logger logger = LoggerFactory.getLogger(AIVoiceController.class);
    
    @Autowired
    private AIVoiceAssistantService aiVoiceAssistantService;

    /**
     * Process voice input with AI
     * POST /api/ai-voice/process
     * Body: { "audioData": "base64 audio", "context": {} }
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processVoiceInput(@RequestBody Map<String, Object> request) {
        logger.info("AI Voice process request received");
        
        String audioData = (String) request.get("audioData");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (audioData == null || audioData.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Audio data is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = aiVoiceAssistantService.processVoiceInput(audioData, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Process text input with AI
     * POST /api/ai-voice/text
     * Body: { "text": "Hello", "context": {} }
     */
    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> processTextInput(@RequestBody Map<String, Object> request) {
        logger.info("AI Voice text process request received");
        
        String text = (String) request.get("text");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (text == null || text.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = aiVoiceAssistantService.processTextInput(text, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Have a conversation with AI
     * POST /api/ai-voice/converse
     * Body: { "message": "Hello", "conversationId": "uuid", "context": {} }
     */
    @PostMapping("/converse")
    public ResponseEntity<Map<String, Object>> converse(@RequestBody Map<String, Object> request) {
        logger.info("AI Voice converse request received");
        
        String message = (String) request.get("message");
        String conversationId = (String) request.getOrDefault("conversationId", UUID.randomUUID().toString());
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (message == null || message.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Message is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = aiVoiceAssistantService.converse(message, conversationId, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Get AI greeting
     * GET /api/ai-voice/greeting?language=en-US
     */
    @GetMapping("/greeting")
    public ResponseEntity<Map<String, Object>> getGreeting(
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        logger.info("AI Voice greeting request received");
        
        Map<String, Object> result = aiVoiceAssistantService.getGreeting(language);
        return ResponseEntity.ok(result);
    }

    /**
     * Get AI help
     * GET /api/ai-voice/help?language=en-US
     */
    @GetMapping("/help")
    public ResponseEntity<Map<String, Object>> getHelp(
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        logger.info("AI Voice help request received");
        
        Map<String, Object> result = aiVoiceAssistantService.getHelp(language);
        return ResponseEntity.ok(result);
    }

    /**
     * Execute an action
     * POST /api/ai-voice/execute
     * Body: { "action": "search_product", "parameters": {}, "context": {} }
     */
    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeAction(@RequestBody Map<String, Object> request) {
        logger.info("AI Voice execute action request received");
        
        String action = (String) request.get("action");
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = (Map<String, Object>) request.getOrDefault("parameters", new HashMap<>());
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (action == null || action.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Action is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = aiVoiceAssistantService.executeAction(action, parameters, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Get conversation history
     * GET /api/ai-voice/conversation/{conversationId}?limit=20
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversationHistory(
            @PathVariable String conversationId,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        logger.info("AI Voice conversation history request received");
        
        Map<String, Object> result = aiVoiceAssistantService.getConversationHistory(conversationId, limit);
        return ResponseEntity.ok(result);
    }

    /**
     * Clear conversation
     * DELETE /api/ai-voice/conversation/{conversationId}
     */
    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Map<String, Object>> clearConversation(@PathVariable String conversationId) {
        logger.info("AI Voice clear conversation request received");
        
        Map<String, Object> result = aiVoiceAssistantService.clearConversation(conversationId);
        return ResponseEntity.ok(result);
    }

    /**
     * Get assistant settings
     * GET /api/ai-voice/settings/{userId}
     */
    @GetMapping("/settings/{userId}")
    public ResponseEntity<Map<String, Object>> getAssistantSettings(@PathVariable Long userId) {
        logger.info("AI Voice settings request received for user: {}", userId);
        
        Map<String, Object> result = aiVoiceAssistantService.getAssistantSettings(userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Update assistant settings
     * PUT /api/ai-voice/settings/{userId}
     * Body: { "language": "en-US", "voiceType": "female", ... }
     */
    @PutMapping("/settings/{userId}")
    public ResponseEntity<Map<String, Object>> updateAssistantSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> settings) {
        logger.info("AI Voice update settings request received for user: {}", userId);
        
        Map<String, Object> result = aiVoiceAssistantService.updateAssistantSettings(userId, settings);
        return ResponseEntity.ok(result);
    }

    /**
     * Analyze intent
     * POST /api/ai-voice/analyze
     * Body: { "input": "search for apples", "context": {} }
     */
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeIntent(@RequestBody Map<String, Object> request) {
        logger.info("AI Voice analyze intent request received");
        
        String input = (String) request.get("input");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (input == null || input.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Input is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = aiVoiceAssistantService.analyzeIntent(input, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Get suggestions
     * POST /api/ai-voice/suggestions
     * Body: { "currentPage": "dashboard", "userId": 1 }
     */
    @PostMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getSuggestions(@RequestBody Map<String, Object> context) {
        logger.info("AI Voice suggestions request received");
        
        Map<String, Object> result = aiVoiceAssistantService.getSuggestions(context);
        return ResponseEntity.ok(result);
    }

    /**
     * Train assistant
     * POST /api/ai-voice/train
     * Body: { "question": "What is the price?", "answer": "Let me check the price.", "intent": "price_check" }
     */
    @PostMapping("/train")
    public ResponseEntity<Map<String, Object>> trainAssistant(@RequestBody Map<String, Object> trainingData) {
        logger.info("AI Voice train request received");
        
        Map<String, Object> result = aiVoiceAssistantService.trainAssistant(trainingData);
        return ResponseEntity.ok(result);
    }

    /**
     * Health check
     * GET /api/ai-voice/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("status", "AI Voice Assistant service is running");
        result.put("service", "SMMS AI Voice Assistant");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }
}