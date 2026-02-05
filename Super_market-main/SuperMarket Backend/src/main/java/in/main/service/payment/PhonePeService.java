package in.main.service.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.entities.Profile;

@Service
public class PhonePeService implements PaymentGatewayService {
    
    private static final String PHONEPE_API_URL = "https://api.phonepe.com/apis/hermes";
    private static final String PHONEPE_REDIRECT_URL = "https://www.phonepe.com/pay";
    
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Profile profile) {
        PaymentInitiateResponse response = new PaymentInitiateResponse();
        
        try {
            // Create PhonePe payment payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("merchantId", profile.getPhonepeMerchantId());
            payload.put("merchantTransactionId", "TXN_" + System.currentTimeMillis());
            payload.put("merchantUserId", "USER_" + request.getUserId());
            payload.put("amount", (int)(request.getAmount() * 100)); // Convert to paise
            payload.put("redirectUrl", "http://localhost:3000/payment/success");
            payload.put("redirectMode", "REDIRECT");
            payload.put("callbackUrl", "http://localhost:8080/api/webhooks/phonepe");
            
            Map<String, String> paymentInstrument = new HashMap<>();
            paymentInstrument.put("type", "PAY_PAGE");
            payload.put("paymentInstrument", paymentInstrument);
            
            // Convert payload to Base64
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(payload);
            String base64Payload = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            
            // Generate checksum: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
            String checksumString = base64Payload + "/pg/v1/pay" + profile.getPhonepeSaltKey();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(checksumString.getBytes(StandardCharsets.UTF_8));
            String checksum = bytesToHex(hash) + "###" + profile.getPhonepeSaltIndex();
            
            // Make API request
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-VERIFY", checksum);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("request", base64Payload);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> apiResponse = restTemplate.exchange(
                PHONEPE_API_URL + "/pg/v1/pay",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
                Map<String, Object> phonepeResponse = apiResponse.getBody();
                
                if ("SUCCESS".equals(phonepeResponse.get("code"))) {
                    Map<String, Object> data = (Map<String, Object>) phonepeResponse.get("data");
                    String instrumentResponseUrl = (String) data.get("instrumentResponse.redirectInfo.url");
                    
                    response.setStatus("success");
                    response.setMessage("PhonePe payment initiated successfully");
                    response.setOrderId((String) payload.get("merchantTransactionId"));
                    response.setPaymentUrl(instrumentResponseUrl);
                    response.setGatewayData(data);
                } else {
                    response.setStatus("error");
                    response.setMessage("PhonePe API returned error: " + phonepeResponse.get("message"));
                }
            } else {
                response.setStatus("error");
                response.setMessage("Failed to initiate PhonePe payment");
            }
            
        } catch (Exception e) {
            response.setStatus("error");
            response.setMessage("Error initiating PhonePe payment: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public boolean verifyWebhookSignature(String payload, String signature, Profile profile) {
        try {
            // PhonePe signature format: SHA256(base64Payload + saltKey) + ### + saltIndex
            String[] parts = signature.split("###");
            if (parts.length != 2) {
                return false;
            }
            
            String receivedChecksum = parts[0];
            String checksumString = payload + profile.getPhonepeSaltKey();
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(checksumString.getBytes(StandardCharsets.UTF_8));
            String expectedChecksum = bytesToHex(hash);
            
            return expectedChecksum.equalsIgnoreCase(receivedChecksum);
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public String getGatewayName() {
        return "phonepe";
    }
    
    @Override
    public boolean isEnabled(Profile profile) {
        return profile.getPhonepeEnabled() != null && profile.getPhonepeEnabled()
            && profile.getPhonepeMerchantId() != null && !profile.getPhonepeMerchantId().isEmpty()
            && profile.getPhonepeSaltKey() != null && !profile.getPhonepeSaltKey().isEmpty();
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
