package in.main.service;

import java.util.List;
import java.util.Map;

public interface VoiceControlService {

    Map<String, Object> getVoiceConfig();

    void updateVoiceConfig(Map<String, Object> config);

    String testVoiceAI();

    boolean isVoiceAIEnabled();

    void setVoiceAIEnabled(boolean enabled);

    // Additional methods for voice control functionality
    String processVoiceCommand(String command);

    List<String> getAvailableCommands();

    String simulateVoiceCommand(String command);

    Map<String, Object> getVoiceStatus();
}
