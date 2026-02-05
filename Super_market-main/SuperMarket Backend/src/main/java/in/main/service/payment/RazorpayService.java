package in.main.service.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.entities.Profile;

@Service
public class RazorpayService implements PaymentGatewayService {
    
    private static final String RAZORPAY_API_URL = "https://api.razorpay.com/v1";
    
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Profile profile) {
        PaymentInitiateResponse response = new PaymentInitiateResponse();
        
        try {
            // Create Razorpay order
            RestTemplate restTemplate = new RestTemplate();
            
            String auth = profile.getRazorpayKeyId() + ":" + profile.getRazorpayKeySecret();
            String encodedAuth = java.util.Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + encodedAuth);
            
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("amount", (int)(request.getAmount() * 100)); // Convert to paise
            orderData.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
            orderData.put("receipt", "rcpt_" + System.currentTimeMillis());
            
            Map<String, String> notes = new HashMap<>();
            notes.put("customer_name", request.getCustomerName());
            notes.put("customer_email", request.getCustomerEmail());
            orderData.put("notes", notes);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(orderData, headers);
            
            ResponseEntity<Map> apiResponse = restTemplate.exchange(
                RAZORPAY_API_URL + "/orders",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
                Map<String, Object> orderResponse = apiResponse.getBody();
                
                // Prepare Razorpay options for frontend
                Map<String, Object> razorpayOptions = new HashMap<>();
                razorpayOptions.put("key", profile.getRazorpayKeyId());
                razorpayOptions.put("amount", orderResponse.get("amount"));
                razorpayOptions.put("currency", orderResponse.get("currency"));
                razorpayOptions.put("name", profile.getShopName());
                razorpayOptions.put("order_id", orderResponse.get("id"));
                razorpayOptions.put("prefill", Map.of(
                    "name", request.getCustomerName(),
                    "email", request.getCustomerEmail(),
                    "contact", request.getCustomerPhone() != null ? request.getCustomerPhone() : ""
                ));
                
                response.setStatus("success");
                response.setMessage("Razorpay order created successfully");
                response.setOrderId((String) orderResponse.get("id"));
                response.setGatewayData(razorpayOptions);
            } else {
                response.setStatus("error");
                response.setMessage("Failed to create Razorpay order");
            }
            
        } catch (Exception e) {
            response.setStatus("error");
            response.setMessage("Error initiating Razorpay payment: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public boolean verifyWebhookSignature(String payload, String signature, Profile profile) {
        try {
            String secret = profile.getRazorpayWebhookSecret();
            if (secret == null || secret.isEmpty()) {
                return false;
            }
            
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = bytesToHex(hash);
            
            return expectedSignature.equalsIgnoreCase(signature);
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public String getGatewayName() {
        return "razorpay";
    }
    
    @Override
    public boolean isEnabled(Profile profile) {
        return profile.getRazorpayEnabled() != null && profile.getRazorpayEnabled()
            && profile.getRazorpayKeyId() != null && !profile.getRazorpayKeyId().isEmpty()
            && profile.getRazorpayKeySecret() != null && !profile.getRazorpayKeySecret().isEmpty();
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
