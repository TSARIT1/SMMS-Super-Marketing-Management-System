package in.main.service.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Component
public class AcuratoClient {

    @Value("${acurato.api.key:}")
    private String acuratoApiKey;

    @Value("${acurato.api.secret:}")
    private String acuratoApiSecret;

    @Value("${acurato.endpoint:https://api.acurato.example}")
    private String acuratoEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Create a provider order (mock implementation). Returns a map compatible with frontend expectations.
     */
    public Map<String, Object> createOrder(Double amount, String currency) {
        // In a real integration you would POST to Acurato's order endpoint with auth headers
        String mockOrderId = "acr_" + UUID.randomUUID();
        return Map.of(
                "orderId", mockOrderId,
                "amount", amount,
                "currency", currency,
                "keyId", acuratoApiKey
        );
    }

    /**
     * Verify incoming payment signature using HMAC-SHA256(orderId|paymentId, secret)
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            if (acuratoApiSecret == null || acuratoApiSecret.isEmpty()) return false;
            String payload = orderId + "|" + paymentId;
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(acuratoApiSecret.getBytes(), "HmacSHA256"));
            byte[] digest = hmac.doFinal(payload.getBytes());
            String expected = Base64.getEncoder().encodeToString(digest);
            return expected.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Simple GET helper for the provider (kept for future use)
     */
    public ResponseEntity<String> ping() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return ResponseEntity.ok("pong");
    }
}