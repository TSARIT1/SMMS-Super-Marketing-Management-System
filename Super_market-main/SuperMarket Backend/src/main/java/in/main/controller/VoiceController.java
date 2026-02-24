package in.main.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import in.main.service.VoiceService;

import java.util.HashMap;
import java.util.Map;

/**
 * Voice API Controller
 * Provides REST endpoints for Speech-to-Text and Text-to-Speech operations
 * Integrates with AI services for intelligent voice processing
 */
@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VoiceController {

    private static final Logger logger = LoggerFactory.getLogger(VoiceController.class);
    
    @Autowired
    private VoiceService voiceService;

    // ==================== SPEECH-TO-TEXT ENDPOINTS ====================
    
    /**
     * Convert speech to text
     * POST /api/voice/stt
     * Body: { "audioData": "base64 encoded audio", "language": "en-US" }
     */
    @PostMapping("/stt")
    public ResponseEntity<Map<String, Object>> speechToText(@RequestBody Map<String, Object> request) {
        logger.info("Speech-to-text request received");
        
        String audioData = (String) request.get("audioData");
        String language = (String) request.getOrDefault("language", "en-US");
        
        Map<String, Object> result = voiceService.speechToText(audioData, language);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Convert speech to text with auto language detection
     * POST /api/voice/stt/auto
     * Body: { "audioData": "base64 encoded audio" }
     */
    @PostMapping("/stt/auto")
    public ResponseEntity<Map<String, Object>> speechToTextAutoDetect(@RequestBody Map<String, Object> request) {
        logger.info("Auto-detect speech-to-text request received");
        
        String audioData = (String) request.get("audioData");
        
        Map<String, Object> result = voiceService.speechToTextAutoDetect(audioData);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Transcribe audio file
     * POST /api/voice/transcribe
     * Multipart form with audio file
     */
    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribeAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        logger.info("Audio transcription request received for file: {}", file.getOriginalFilename());
        
        try {
            String filename = file.getOriginalFilename();
            String format = "wav";
            
            if (filename != null) {
                int dotIndex = filename.lastIndexOf('.');
                if (dotIndex > 0) {
                    format = filename.substring(dotIndex + 1).toLowerCase();
                }
            }
            
            Map<String, Object> result = voiceService.transcribeAudio(file.getBytes(), format, language);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error transcribing audio file: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== TEXT-TO-SPEECH ENDPOINTS ====================
    
    /**
     * Convert text to speech
     * POST /api/voice/tts
     * Body: { "text": "Hello world", "language": "en-US", "voiceType": "female", "speed": 1.0 }
     */
    @PostMapping("/tts")
    public ResponseEntity<Map<String, Object>> textToSpeech(@RequestBody Map<String, Object> request) {
        logger.info("Text-to-speech request received");
        
        String text = (String) request.get("text");
        String language = (String) request.getOrDefault("language", "en-US");
        String voiceType = (String) request.getOrDefault("voiceType", "female");
        Double speed = ((Number) request.getOrDefault("speed", 1.0)).doubleValue();
        
        if (text == null || text.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.textToSpeech(text, language, voiceType, speed);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Convert SSML to speech
     * POST /api/voice/tts/ssml
     * Body: { "ssml": "<speak>Hello</speak>", "language": "en-US" }
     */
    @PostMapping("/tts/ssml")
    public ResponseEntity<Map<String, Object>> textToSpeechSSML(@RequestBody Map<String, Object> request) {
        logger.info("SSML text-to-speech request received");
        
        String ssml = (String) request.get("ssml");
        String language = (String) request.getOrDefault("language", "en-US");
        
        if (ssml == null || ssml.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "SSML is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.textToSpeechSSML(ssml, language);
        return ResponseEntity.ok(result);
    }

    // ==================== VOICE COMMAND PROCESSING ====================
    
    /**
     * Process voice command
     * POST /api/voice/command
     * Body: { "text": "search for apples", "context": { "userId": 1 } }
     */
    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> processVoiceCommand(@RequestBody Map<String, Object> request) {
        logger.info("Voice command processing request received");
        
        String text = (String) request.get("text");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (text == null || text.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.processVoiceCommand(text, context);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-ENHANCED VOICE OPERATIONS ====================
    
    /**
     * Process voice with AI enhancement
     * POST /api/voice/ai/process
     * Body: { "audioData": "base64 audio", "aiContext": { "aiServiceType": "sales" } }
     */
    @PostMapping("/ai/process")
    public ResponseEntity<Map<String, Object>> processWithAI(@RequestBody Map<String, Object> request) {
        logger.info("AI-enhanced voice processing request received");
        
        String audioData = (String) request.get("audioData");
        @SuppressWarnings("unchecked")
        Map<String, Object> aiContext = (Map<String, Object>) request.getOrDefault("aiContext", new HashMap<>());
        
        if (audioData == null || audioData.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Audio data is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.processWithAI(audioData, aiContext);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Generate AI voice response
     * POST /api/voice/ai/respond
     * Body: { "query": "show me sales report", "aiServiceType": "sales", "context": {} }
     */
    @PostMapping("/ai/respond")
    public ResponseEntity<Map<String, Object>> generateAIVoiceResponse(@RequestBody Map<String, Object> request) {
        logger.info("AI voice response generation request received");
        
        String query = (String) request.get("query");
        String aiServiceType = (String) request.getOrDefault("aiServiceType", "general");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
        
        if (query == null || query.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Query is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.generateAIVoiceResponse(query, aiServiceType, context);
        return ResponseEntity.ok(result);
    }

    // ==================== VOICE ANALYTICS ====================
    
    /**
     * Analyze voice sentiment
     * POST /api/voice/analyze/sentiment
     * Body: { "audioData": "base64 audio" }
     */
    @PostMapping("/analyze/sentiment")
    public ResponseEntity<Map<String, Object>> analyzeVoiceSentiment(@RequestBody Map<String, Object> request) {
        logger.info("Voice sentiment analysis request received");
        
        String audioData = (String) request.get("audioData");
        
        if (audioData == null || audioData.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Audio data is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> result = voiceService.analyzeVoiceSentiment(audioData);
        return ResponseEntity.ok(result);
    }

    // ==================== CONFIGURATION ENDPOINTS ====================
    
    /**
     * Get supported languages
     * GET /api/voice/languages
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        logger.info("Supported languages request received");
        
        Map<String, Object> result = voiceService.getSupportedLanguages();
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get available voices for a language
     * GET /api/voice/voices?language=en-US
     */
    @GetMapping("/voices")
    public ResponseEntity<Map<String, Object>> getAvailableVoices(
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        logger.info("Available voices request received for language: {}", language);
        
        Map<String, Object> result = voiceService.getAvailableVoices(language);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Health check for voice service
     * GET /api/voice/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("status", "Voice service is running");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }
}