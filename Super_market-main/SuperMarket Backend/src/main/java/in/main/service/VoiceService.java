package in.main.service;

import java.util.Map;

/**
 * Voice Service Interface
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) operations
 * Integrates with AI services for intelligent voice processing
 */
public interface VoiceService {
    
    // Speech-to-Text (STT) Operations
    /**
     * Convert audio data to text
     * @param audioData Base64 encoded audio data
     * @param language Language code (e.g., "en-US", "hi-IN")
     * @return Map containing transcribed text and metadata
     */
    Map<String, Object> speechToText(String audioData, String language);
    
    /**
     * Convert audio data to text with automatic language detection
     * @param audioData Base64 encoded audio data
     * @return Map containing transcribed text, detected language, and metadata
     */
    Map<String, Object> speechToTextAutoDetect(String audioData);
    
    /**
     * Transcribe audio file (supports multiple formats)
     * @param audioData Raw audio bytes
     * @param format Audio format (wav, mp3, ogg, webm)
     * @param language Language code
     * @return Map containing transcribed text and metadata
     */
    Map<String, Object> transcribeAudio(byte[] audioData, String format, String language);
    
    // Text-to-Speech (TTS) Operations
    /**
     * Convert text to speech
     * @param text Text to convert
     * @param language Language code for voice selection
     * @param voiceType Voice type (male, female, neutral)
     * @param speed Speech speed (0.5 to 2.0)
     * @return Map containing Base64 encoded audio data and metadata
     */
    Map<String, Object> textToSpeech(String text, String language, String voiceType, double speed);
    
    /**
     * Convert text to speech with SSML support
     * @param ssml SSML formatted text
     * @param language Language code
     * @return Map containing Base64 encoded audio data
     */
    Map<String, Object> textToSpeechSSML(String ssml, String language);
    
    // Voice Commands Processing
    /**
     * Process voice command and execute corresponding action
     * @param transcribedText Transcribed voice command
     * @param context Additional context (userId, sessionId, etc.)
     * @return Map containing command result and response
     */
    Map<String, Object> processVoiceCommand(String transcribedText, Map<String, Object> context);
    
    // AI-Enhanced Voice Operations
    /**
     * Process voice input with AI enhancement
     * @param audioData Base64 encoded audio data
     * @param aiContext Context for AI processing (intent, entities, etc.)
     * @return Map containing AI-enhanced response
     */
    Map<String, Object> processWithAI(String audioData, Map<String, Object> aiContext);
    
    /**
     * Generate AI response and convert to speech
     * @param userQuery User's query text
     * @param aiServiceType Type of AI service (sales, support, operations, etc.)
     * @param context Additional context
     * @return Map containing both text response and audio data
     */
    Map<String, Object> generateAIVoiceResponse(String userQuery, String aiServiceType, Map<String, Object> context);
    
    // Voice Analytics
    /**
     * Analyze voice for sentiment and emotion
     * @param audioData Base64 encoded audio data
     * @return Map containing sentiment analysis results
     */
    Map<String, Object> analyzeVoiceSentiment(String audioData);
    
    /**
     * Get supported languages for STT/TTS
     * @return Map containing list of supported languages
     */
    Map<String, Object> getSupportedLanguages();
    
    /**
     * Get available voice types for TTS
     * @param language Language code
     * @return Map containing available voices
     */
    Map<String, Object> getAvailableVoices(String language);
}