package in.main.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VoiceControlServiceImpl implements VoiceControlService {

    private boolean voiceAIEnabled = true;
    private String language = "en-US";
    private String speed = "normal";
    private double confidence = 0.8;

    @Override
    public Map<String, Object> getVoiceConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("enabled", voiceAIEnabled);
        config.put("language", language);
        config.put("speed", speed);
        config.put("confidence", confidence);
        return config;
    }

    @Override
    public void updateVoiceConfig(Map<String, Object> config) {
        if (config.containsKey("language")) {
            this.language = config.get("language").toString();
        }
        if (config.containsKey("speed")) {
            this.speed = config.get("speed").toString();
        }
        if (config.containsKey("confidence")) {
            this.confidence = Double.parseDouble(config.get("confidence").toString());
        }
        if (config.containsKey("enabled")) {
            this.voiceAIEnabled = Boolean.parseBoolean(config.get("enabled").toString());
        }
    }

    @Override
    public String testVoiceAI() {
        if (!voiceAIEnabled) {
            return "Voice AI is disabled";
        }
        return "Voice AI test successful. Language: " + language + ", Speed: " + speed;
    }

    @Override
    public boolean isVoiceAIEnabled() {
        return voiceAIEnabled;
    }

    @Override
    public void setVoiceAIEnabled(boolean enabled) {
        this.voiceAIEnabled = enabled;
    }

    @Override
    public String processVoiceCommand(String command) {
        if (!voiceAIEnabled) {
            return "Voice AI is disabled";
        }

        String lowerCommand = command.toLowerCase().trim();

        // Basic command processing
        if (lowerCommand.contains("hello") || lowerCommand.contains("hi")) {
            return "Hello! How can I help you with your shopping today?";
        } else if (lowerCommand.contains("search") || lowerCommand.contains("find")) {
            return "I'll help you search for products. What are you looking for?";
        } else if (lowerCommand.contains("add to cart") || lowerCommand.contains("buy")) {
            return "Adding item to your cart. Please confirm the quantity.";
        } else if (lowerCommand.contains("checkout") || lowerCommand.contains("purchase")) {
            return "Proceeding to checkout. Please review your order.";
        } else if (lowerCommand.contains("help") || lowerCommand.contains("commands")) {
            return "Available commands: search products, add to cart, checkout, view cart, help";
        } else {
            return "I'm sorry, I didn't understand that command. Try saying 'help' for available commands.";
        }
    }

    @Override
    public List<String> getAvailableCommands() {
        return Arrays.asList(
            "search products",
            "add to cart",
            "view cart",
            "checkout",
            "remove from cart",
            "product details",
            "help",
            "categories",
            "deals",
            "support"
        );
    }

    @Override
    public String simulateVoiceCommand(String command) {
        // Simulate voice processing with some delay and response
        try {
            Thread.sleep(500); // Simulate processing time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return processVoiceCommand(command) + " (Simulated voice response)";
    }

    @Override
    public Map<String, Object> getVoiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", voiceAIEnabled);
        status.put("language", language);
        status.put("confidence", confidence);
        status.put("status", voiceAIEnabled ? "active" : "disabled");
        status.put("availableCommands", getAvailableCommands().size());
        status.put("lastActivity", System.currentTimeMillis());
        return status;
    }
}
