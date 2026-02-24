package in.main.service;

import java.util.Map;

/**
 * AI Voice Assistant Service Interface
 * Provides intelligent voice assistant capabilities with AI integration
 * Combines speech recognition, natural language understanding, and AI responses
 */
public interface AIVoiceAssistantService {
    
    /**
     * Process voice input and generate AI response
     * @param audioData Base64 encoded audio data
     * @param context Conversation context (userId, sessionId, language, etc.)
     * @return Map containing transcribed text, AI response, and TTS-ready audio
     */
    Map<String, Object> processVoiceInput(String audioData, Map<String, Object> context);
    
    /**
     * Process text input and generate AI response with voice output
     * @param text User text input
     * @param context Conversation context
     * @return Map containing AI response text and TTS-ready audio
     */
    Map<String, Object> processTextInput(String text, Map<String, Object> context);
    
    /**
     * Have a conversation with the AI assistant
     * @param message User message
     * @param conversationId Conversation ID for context persistence
     * @param context Additional context
     * @return Map containing AI response and conversation metadata
     */
    Map<String, Object> converse(String message, String conversationId, Map<String, Object> context);
    
    /**
     * Get AI assistant greeting message
     * @param language Language code
     * @return Map containing greeting text and audio
     */
    Map<String, Object> getGreeting(String language);
    
    /**
     * Get AI assistant help/commands list
     * @param language Language code
     * @return Map containing help information
     */
    Map<String, Object> getHelp(String language);
    
    /**
     * Execute a specific action based on voice command
     * @param action Action type (search, order, inventory, etc.)
     * @param parameters Action parameters
     * @param context User context
     * @return Map containing action result and response
     */
    Map<String, Object> executeAction(String action, Map<String, Object> parameters, Map<String, Object> context);
    
    /**
     * Get conversation history
     * @param conversationId Conversation ID
     * @param limit Maximum number of messages to return
     * @return Map containing conversation history
     */
    Map<String, Object> getConversationHistory(String conversationId, int limit);
    
    /**
     * Clear conversation history
     * @param conversationId Conversation ID
     * @return Success status
     */
    Map<String, Object> clearConversation(String conversationId);
    
    /**
     * Get AI assistant personality/settings
     * @param userId User ID for personalized settings
     * @return Map containing assistant settings
     */
    Map<String, Object> getAssistantSettings(Long userId);
    
    /**
     * Update AI assistant personality/settings
     * @param userId User ID
     * @param settings New settings
     * @return Updated settings
     */
    Map<String, Object> updateAssistantSettings(Long userId, Map<String, Object> settings);
    
    /**
     * Analyze user intent from voice/text input
     * @param input User input text
     * @param context Context information
     * @return Map containing detected intent, entities, and confidence
     */
    Map<String, Object> analyzeIntent(String input, Map<String, Object> context);
    
    /**
     * Generate contextual suggestions based on current state
     * @param context Current context
     * @return Map containing suggested actions/queries
     */
    Map<String, Object> getSuggestions(Map<String, Object> context);
    
    /**
     * Train/teach the AI assistant new responses
     * @param trainingData Training data containing questions and answers
     * @return Success status
     */
    Map<String, Object> trainAssistant(Map<String, Object> trainingData);
}