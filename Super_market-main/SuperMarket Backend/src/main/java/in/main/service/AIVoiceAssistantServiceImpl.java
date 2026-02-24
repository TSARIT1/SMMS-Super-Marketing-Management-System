package in.main.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI Voice Assistant Service Implementation
 * Provides intelligent voice assistant with AI-powered responses
 */
@Service
public class AIVoiceAssistantServiceImpl implements AIVoiceAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(AIVoiceAssistantServiceImpl.class);
    
    @Value("${ai.voice.assistant.name:SMMS Assistant}")
    private String assistantName;
    
    @Value("${ai.voice.assistant.default-language:en-US}")
    private String defaultLanguage;
    
    @Autowired
    private VoiceService voiceService;
    
    @Autowired
    private AISalesMarketingService aiSalesMarketingService;
    
    @Autowired
    private AISupportAutomationService aiSupportAutomationService;
    
    @Autowired
    private AIOperationsMasterService aiOperationsMasterService;
    
    // In-memory conversation storage (in production, use database)
    private final Map<String, List<Map<String, Object>>> conversations = new ConcurrentHashMap<>();
    
    // AI Knowledge Base for responses
    private static final Map<String, String> KNOWLEDGE_BASE = new LinkedHashMap<>();
    static {
        KNOWLEDGE_BASE.put("greeting", "Hello! I'm your SMMS Assistant. How can I help you today?");
        KNOWLEDGE_BASE.put("help", "I can help you with: searching products, checking inventory, viewing orders, generating reports, and managing your supermarket operations.");
        KNOWLEDGE_BASE.put("goodbye", "Thank you for using SMMS Assistant. Have a great day!");
        KNOWLEDGE_BASE.put("thanks", "You're welcome! Is there anything else I can help you with?");
        KNOWLEDGE_BASE.put("unknown", "I'm not sure I understand. Could you please rephrase that? You can ask me about products, orders, inventory, or reports.");
    }
    
    // Intent patterns for NLU
    private static final Map<String, List<String>> INTENT_PATTERNS = new LinkedHashMap<>();
    static {
        INTENT_PATTERNS.put("greeting", Arrays.asList("hello", "hi", "hey", "good morning", "good afternoon", "good evening"));
        INTENT_PATTERNS.put("goodbye", Arrays.asList("bye", "goodbye", "see you", "exit", "quit"));
        INTENT_PATTERNS.put("thanks", Arrays.asList("thank you", "thanks", "appreciate"));
        INTENT_PATTERNS.put("help", Arrays.asList("help", "what can you do", "how to", "guide"));
        INTENT_PATTERNS.put("search_product", Arrays.asList("search", "find", "look for", "where is", "do you have"));
        INTENT_PATTERNS.put("add_to_cart", Arrays.asList("add to cart", "buy", "purchase", "order"));
        INTENT_PATTERNS.put("view_orders", Arrays.asList("my orders", "order history", "track order", "where is my order"));
        INTENT_PATTERNS.put("check_inventory", Arrays.asList("inventory", "stock", "available", "in stock", "quantity"));
        INTENT_PATTERNS.put("get_report", Arrays.asList("report", "analytics", "statistics", "sales data", "performance"));
        INTENT_PATTERNS.put("manage_customers", Arrays.asList("customers", "clients", "customer list"));
        INTENT_PATTERNS.put("manage_discounts", Arrays.asList("discount", "offer", "promotion", "coupon"));
        INTENT_PATTERNS.put("business_hours", Arrays.asList("hours", "open", "close", "timing"));
        INTENT_PATTERNS.put("profile", Arrays.asList("profile", "account", "settings", "my account"));
    }

    @Override
    public Map<String, Object> processVoiceInput(String audioData, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Processing voice input with AI");
            
            // Step 1: Speech to Text
            Map<String, Object> sttResult = voiceService.speechToTextAutoDetect(audioData);
            
            if (!Boolean.TRUE.equals(sttResult.get("success"))) {
                result.put("success", false);
                result.put("error", "Failed to transcribe audio");
                result.put("sttError", sttResult.get("error"));
                return result;
            }
            
            String transcribedText = (String) sttResult.get("text");
            String detectedLanguage = (String) sttResult.getOrDefault("detectedLanguage", defaultLanguage);
            
            // Step 2: Process with AI
            Map<String, Object> aiResult = processTextInput(transcribedText, context);
            
            result.put("success", true);
            result.put("transcribedText", transcribedText);
            result.put("detectedLanguage", detectedLanguage);
            result.put("aiResponse", aiResult.get("response"));
            result.put("intent", aiResult.get("intent"));
            result.put("action", aiResult.get("action"));
            result.put("ttsReady", aiResult.get("ttsReady"));
            result.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Error processing voice input: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> processTextInput(String text, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Processing text input with AI: {}", text);
            
            // Analyze intent
            Map<String, Object> intentAnalysis = analyzeIntent(text, context);
            String intent = (String) intentAnalysis.get("intent");
            double confidence = (Double) intentAnalysis.get("confidence");
            
            // Generate response based on intent
            String response = generateResponse(intent, text, context);
            
            // Determine action
            Map<String, Object> actionInfo = determineAction(intent, text, context);
            
            // Prepare TTS-ready response
            Map<String, Object> ttsResult = voiceService.textToSpeech(response, 
                (String) context.getOrDefault("language", defaultLanguage), 
                (String) context.getOrDefault("voiceType", "female"), 
                1.0);
            
            result.put("success", true);
            result.put("response", response);
            result.put("intent", intent);
            result.put("confidence", confidence);
            result.put("entities", intentAnalysis.get("entities"));
            result.put("action", actionInfo);
            result.put("ttsReady", ttsResult);
            result.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Error processing text input: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("response", KNOWLEDGE_BASE.get("unknown"));
        }
        return result;
    }

    @Override
    public Map<String, Object> converse(String message, String conversationId, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Conversing with AI, conversationId: {}", conversationId);
            
            // Get or create conversation
            List<Map<String, Object>> history = conversations.computeIfAbsent(conversationId, k -> new ArrayList<>());
            
            // Add user message to history
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", message);
            userMessage.put("timestamp", System.currentTimeMillis());
            history.add(userMessage);
            
            // Process with context from history
            Map<String, Object> enrichedContext = new HashMap<>(context);
            enrichedContext.put("conversationHistory", history);
            
            // Generate AI response
            Map<String, Object> aiResult = processTextInput(message, enrichedContext);
            
            // Add assistant response to history
            Map<String, Object> assistantMessage = new HashMap<>();
            assistantMessage.put("role", "assistant");
            assistantMessage.put("content", aiResult.get("response"));
            assistantMessage.put("intent", aiResult.get("intent"));
            assistantMessage.put("timestamp", System.currentTimeMillis());
            history.add(assistantMessage);
            
            // Keep only last 50 messages
            if (history.size() > 50) {
                history.subList(0, history.size() - 50).clear();
            }
            
            result.put("success", true);
            result.put("conversationId", conversationId);
            result.put("response", aiResult.get("response"));
            result.put("intent", aiResult.get("intent"));
            result.put("action", aiResult.get("action"));
            result.put("ttsReady", aiResult.get("ttsReady"));
            result.put("messageCount", history.size());
            
        } catch (Exception e) {
            logger.error("Error in conversation: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> getGreeting(String language) {
        Map<String, Object> result = new HashMap<>();
        try {
            String greeting = KNOWLEDGE_BASE.get("greeting");
            
            Map<String, Object> ttsResult = voiceService.textToSpeech(greeting, language, "female", 1.0);
            
            result.put("success", true);
            result.put("greeting", greeting);
            result.put("assistantName", assistantName);
            result.put("language", language);
            result.put("ttsReady", ttsResult);
            result.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Error getting greeting: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> getHelp(String language) {
        Map<String, Object> result = new HashMap<>();
        try {
            String helpText = KNOWLEDGE_BASE.get("help");
            
            // Build detailed help
            List<Map<String, String>> commands = new ArrayList<>();
            commands.add(createCommand("Search Products", "Search for products by name or category"));
            commands.add(createCommand("Check Inventory", "Check stock levels and availability"));
            commands.add(createCommand("View Orders", "See your order history and status"));
            commands.add(createCommand("Generate Reports", "Get sales and analytics reports"));
            commands.add(createCommand("Manage Discounts", "Create and manage discounts and offers"));
            commands.add(createCommand("Customer Management", "View and manage customer information"));
            
            Map<String, Object> ttsResult = voiceService.textToSpeech(helpText, language, "female", 1.0);
            
            result.put("success", true);
            result.put("helpText", helpText);
            result.put("commands", commands);
            result.put("ttsReady", ttsResult);
            
        } catch (Exception e) {
            logger.error("Error getting help: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> executeAction(String action, Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Executing action: {}", action);
            
            Object actionResult = null;
            String response = "";
            
            switch (action.toLowerCase()) {
                case "search_product":
                    actionResult = executeSearchProduct(parameters, context);
                    response = "I found several products matching your search.";
                    break;
                case "add_to_cart":
                    actionResult = executeAddToCart(parameters, context);
                    response = "Product has been added to your cart.";
                    break;
                case "view_orders":
                    actionResult = executeViewOrders(context);
                    response = "Here are your recent orders.";
                    break;
                case "check_inventory":
                    actionResult = executeCheckInventory(parameters, context);
                    response = "Here's the current inventory status.";
                    break;
                case "get_report":
                    actionResult = executeGetReport(parameters, context);
                    response = "Here's your requested report.";
                    break;
                case "manage_customers":
                    actionResult = executeManageCustomers(parameters, context);
                    response = "Here's the customer information.";
                    break;
                default:
                    response = "I'm not sure how to perform that action yet.";
            }
            
            result.put("success", true);
            result.put("action", action);
            result.put("actionResult", actionResult);
            result.put("response", response);
            result.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Error executing action: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> getConversationHistory(String conversationId, int limit) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> history = conversations.get(conversationId);
            
            if (history == null) {
                result.put("success", true);
                result.put("history", Collections.emptyList());
                result.put("messageCount", 0);
                return result;
            }
            
            int fromIndex = Math.max(0, history.size() - limit);
            List<Map<String, Object>> limitedHistory = new ArrayList<>(history.subList(fromIndex, history.size()));
            
            result.put("success", true);
            result.put("conversationId", conversationId);
            result.put("history", limitedHistory);
            result.put("messageCount", history.size());
            
        } catch (Exception e) {
            logger.error("Error getting conversation history: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> clearConversation(String conversationId) {
        Map<String, Object> result = new HashMap<>();
        try {
            conversations.remove(conversationId);
            
            result.put("success", true);
            result.put("message", "Conversation cleared");
            result.put("conversationId", conversationId);
            
        } catch (Exception e) {
            logger.error("Error clearing conversation: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> getAssistantSettings(Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Default settings (in production, fetch from database)
            Map<String, Object> settings = new HashMap<>();
            settings.put("assistantName", assistantName);
            settings.put("language", defaultLanguage);
            settings.put("voiceType", "female");
            settings.put("speechSpeed", 1.0);
            settings.put("personality", "professional");
            settings.put("greetingEnabled", true);
            settings.put("suggestionsEnabled", true);
            settings.put("autoSpeakResponses", true);
            
            result.put("success", true);
            result.put("userId", userId);
            result.put("settings", settings);
            
        } catch (Exception e) {
            logger.error("Error getting assistant settings: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> updateAssistantSettings(Long userId, Map<String, Object> settings) {
        Map<String, Object> result = new HashMap<>();
        try {
            // In production, save to database
            result.put("success", true);
            result.put("userId", userId);
            result.put("settings", settings);
            result.put("message", "Settings updated successfully");
            
        } catch (Exception e) {
            logger.error("Error updating assistant settings: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> analyzeIntent(String input, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            String lowerInput = input.toLowerCase().trim();
            String detectedIntent = "unknown";
            double maxConfidence = 0.0;
            Map<String, Object> entities = new HashMap<>();
            
            // Check each intent pattern
            for (Map.Entry<String, List<String>> entry : INTENT_PATTERNS.entrySet()) {
                for (String pattern : entry.getValue()) {
                    if (lowerInput.contains(pattern)) {
                        double confidence = (double) pattern.length() / lowerInput.length();
                        if (confidence > maxConfidence) {
                            maxConfidence = confidence;
                            detectedIntent = entry.getKey();
                        }
                    }
                }
            }
            
            // Extract entities
            entities.putAll(extractEntities(lowerInput));
            
            // Normalize confidence
            maxConfidence = Math.min(1.0, maxConfidence + 0.5);
            
            result.put("success", true);
            result.put("intent", detectedIntent);
            result.put("confidence", maxConfidence);
            result.put("entities", entities);
            result.put("input", input);
            
        } catch (Exception e) {
            logger.error("Error analyzing intent: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("intent", "unknown");
            result.put("confidence", 0.0);
        }
        return result;
    }

    @Override
    public Map<String, Object> getSuggestions(Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, String>> suggestions = new ArrayList<>();
            
            // Context-based suggestions
            String currentPage = (String) context.get("currentPage");
            
            if ("dashboard".equals(currentPage)) {
                suggestions.add(createSuggestion("Show sales summary", "view_sales_summary"));
                suggestions.add(createSuggestion("Check low stock items", "check_low_stock"));
            } else if ("inventory".equals(currentPage)) {
                suggestions.add(createSuggestion("Search for a product", "search_product"));
                suggestions.add(createSuggestion("Check stock levels", "check_inventory"));
            } else if ("orders".equals(currentPage)) {
                suggestions.add(createSuggestion("View recent orders", "view_orders"));
                suggestions.add(createSuggestion("Track an order", "track_order"));
            } else {
                // Default suggestions
                suggestions.add(createSuggestion("Search for products", "search_product"));
                suggestions.add(createSuggestion("Check inventory", "check_inventory"));
                suggestions.add(createSuggestion("View my orders", "view_orders"));
                suggestions.add(createSuggestion("Generate a report", "get_report"));
            }
            
            result.put("success", true);
            result.put("suggestions", suggestions);
            result.put("context", context);
            
        } catch (Exception e) {
            logger.error("Error getting suggestions: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> trainAssistant(Map<String, Object> trainingData) {
        Map<String, Object> result = new HashMap<>();
        try {
            // In production, this would update the AI model
            String question = (String) trainingData.get("question");
            String answer = (String) trainingData.get("answer");
            String intent = (String) trainingData.get("intent");
            
            if (question != null && answer != null) {
                // Add to knowledge base
                KNOWLEDGE_BASE.put(intent != null ? intent : question.toLowerCase(), answer);
                
                result.put("success", true);
                result.put("message", "Training data added successfully");
                result.put("entriesAdded", 1);
            } else {
                result.put("success", false);
                result.put("error", "Invalid training data format");
            }
            
        } catch (Exception e) {
            logger.error("Error training assistant: {}", e.getMessage());
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    // Private helper methods
    
    private String generateResponse(String intent, String input, Map<String, Object> context) {
        switch (intent) {
            case "greeting":
                return KNOWLEDGE_BASE.get("greeting");
            case "goodbye":
                return KNOWLEDGE_BASE.get("goodbye");
            case "thanks":
                return KNOWLEDGE_BASE.get("thanks");
            case "help":
                return KNOWLEDGE_BASE.get("help");
            case "search_product":
                return "I'll search for that product. What specific item are you looking for?";
            case "add_to_cart":
                return "I can help you add items to your cart. Which product would you like to add?";
            case "view_orders":
                return "Let me fetch your order history for you.";
            case "check_inventory":
                return "I'll check the inventory status. Which product or category would you like to check?";
            case "get_report":
                return "What type of report would you like? I can generate sales, inventory, or customer reports.";
            case "manage_customers":
                return "I can help you manage customers. Would you like to view, add, or update customer information?";
            case "manage_discounts":
                return "I can help you with discounts. Would you like to create a new discount or view existing ones?";
            case "business_hours":
                return "I can help you manage business hours. What changes would you like to make?";
            case "profile":
                return "I can help you with your profile settings. What would you like to update?";
            default:
                return KNOWLEDGE_BASE.get("unknown");
        }
    }
    
    private Map<String, Object> determineAction(String intent, String input, Map<String, Object> context) {
        Map<String, Object> actionInfo = new HashMap<>();
        actionInfo.put("intent", intent);
        actionInfo.put("requiresFollowUp", false);
        actionInfo.put("parameters", new HashMap<String, Object>());
        
        switch (intent) {
            case "search_product":
                actionInfo.put("action", "search_product");
                actionInfo.put("requiresFollowUp", true);
                actionInfo.put("followUpQuestion", "What product are you looking for?");
                break;
            case "add_to_cart":
                actionInfo.put("action", "add_to_cart");
                actionInfo.put("requiresFollowUp", true);
                actionInfo.put("followUpQuestion", "Which product would you like to add?");
                break;
            case "view_orders":
                actionInfo.put("action", "view_orders");
                actionInfo.put("requiresFollowUp", false);
                break;
            case "check_inventory":
                actionInfo.put("action", "check_inventory");
                actionInfo.put("requiresFollowUp", true);
                actionInfo.put("followUpQuestion", "Which product's inventory would you like to check?");
                break;
            case "get_report":
                actionInfo.put("action", "get_report");
                actionInfo.put("requiresFollowUp", true);
                actionInfo.put("followUpQuestion", "What type of report would you like?");
                break;
            default:
                actionInfo.put("action", "none");
        }
        
        return actionInfo;
    }
    
    private Map<String, Object> extractEntities(String input) {
        Map<String, Object> entities = new HashMap<>();
        
        // Extract numbers (quantities, prices)
        java.util.regex.Pattern numberPattern = java.util.regex.Pattern.compile("\\b(\\d+)\\b");
        java.util.regex.Matcher numberMatcher = numberPattern.matcher(input);
        List<Integer> numbers = new ArrayList<>();
        while (numberMatcher.find()) {
            numbers.add(Integer.parseInt(numberMatcher.group(1)));
        }
        if (!numbers.isEmpty()) {
            entities.put("numbers", numbers);
        }
        
        // Extract product names (simple heuristic)
        String[] words = input.split("\\s+");
        List<String> productKeywords = new ArrayList<>();
        for (String word : words) {
            if (word.length() > 3 && !isCommonWord(word)) {
                productKeywords.add(word);
            }
        }
        if (!productKeywords.isEmpty()) {
            entities.put("productKeywords", productKeywords);
        }
        
        return entities;
    }
    
    private boolean isCommonWord(String word) {
        Set<String> commonWords = new HashSet<>(Arrays.asList(
            "the", "this", "that", "these", "those", "have", "has", "had",
            "will", "would", "could", "should", "can", "may", "might",
            "what", "which", "where", "when", "how", "why", "who",
            "please", "want", "need", "like", "show", "tell", "give"
        ));
        return commonWords.contains(word.toLowerCase());
    }
    
    private Map<String, String> createCommand(String name, String description) {
        Map<String, String> command = new HashMap<>();
        command.put("name", name);
        command.put("description", description);
        return command;
    }
    
    private Map<String, String> createSuggestion(String text, String action) {
        Map<String, String> suggestion = new HashMap<>();
        suggestion.put("text", text);
        suggestion.put("action", action);
        return suggestion;
    }
    
    // Action execution methods
    private Object executeSearchProduct(Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "search");
        result.put("query", parameters.get("query"));
        result.put("status", "ready");
        return result;
    }
    
    private Object executeAddToCart(Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "addToCart");
        result.put("productId", parameters.get("productId"));
        result.put("quantity", parameters.getOrDefault("quantity", 1));
        result.put("status", "ready");
        return result;
    }
    
    private Object executeViewOrders(Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "viewOrders");
        result.put("userId", context.get("userId"));
        result.put("status", "ready");
        return result;
    }
    
    private Object executeCheckInventory(Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "checkInventory");
        result.put("productId", parameters.get("productId"));
        result.put("status", "ready");
        return result;
    }
    
    private Object executeGetReport(Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "getReport");
        result.put("reportType", parameters.get("reportType"));
        result.put("status", "ready");
        return result;
    }
    
    private Object executeManageCustomers(Map<String, Object> parameters, Map<String, Object> context) {
        Map<String, Object> result = new HashMap<>();
        result.put("action", "manageCustomers");
        result.put("status", "ready");
        return result;
    }
}