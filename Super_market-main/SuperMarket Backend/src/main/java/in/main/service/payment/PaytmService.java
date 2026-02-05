package in.main.service.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.entities.Profile;

@Service
public class PaytmService implements PaymentGatewayService {
    
    private static final String PAYTM_PAYMENT_URL = "https://securegw.paytm.in/theia/api/v1/initiateTransaction";
    
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Profile profile) {
        PaymentInitiateResponse response = new PaymentInitiateResponse();
        
        try {
            String orderId = "ORDER_" + System.currentTimeMillis();
            
            // Prepare Paytm parameters
            TreeMap<String, String> paytmParams = new TreeMap<>();
            paytmParams.put("MID", profile.getPaytmMerchantId());
            paytmParams.put("WEBSITE", "DEFAULT");
            paytmParams.put("INDUSTRY_TYPE_ID", "Retail");
            paytmParams.put("CHANNEL_ID", "WEB");
            paytmParams.put("ORDER_ID", orderId);
            paytmParams.put("CUST_ID", "CUST_" + request.getUserId());
            paytmParams.put("TXN_AMOUNT", String.format("%.2f", request.getAmount()));
            paytmParams.put("CALLBACK_URL", "http://localhost:8080/api/webhooks/paytm");
            paytmParams.put("EMAIL", request.getCustomerEmail());
            paytmParams.put("MOBILE_NO", request.getCustomerPhone() != null ? request.getCustomerPhone() : "");
            
            // Generate checksum
            String checksum = generatePaytmChecksum(paytmParams, profile.getPaytmMerchantKey());
            paytmParams.put("CHECKSUMHASH", checksum);
            
            response.setStatus("success");
            response.setMessage("Paytm payment initiated successfully");
            response.setOrderId(orderId);
            response.setPaymentUrl(PAYTM_PAYMENT_URL);
            response.setGatewayData(paytmParams);
            
        } catch (Exception e) {
            response.setStatus("error");
            response.setMessage("Error initiating Paytm payment: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public boolean verifyWebhookSignature(String payload, String signature, Profile profile) {
        try {
            // Paytm webhook verification
            // Parse payload and verify checksum
            // This is a simplified version - actual implementation depends on Paytm's format
            return signature != null && !signature.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public String getGatewayName() {
        return "paytm";
    }
    
    @Override
    public boolean isEnabled(Profile profile) {
        return profile.getPaytmEnabled() != null && profile.getPaytmEnabled()
            && profile.getPaytmMerchantId() != null && !profile.getPaytmMerchantId().isEmpty()
            && profile.getPaytmMerchantKey() != null && !profile.getPaytmMerchantKey().isEmpty();
    }
    
    private String generatePaytmChecksum(TreeMap<String, String> parameters, String merchantKey) throws Exception {
        StringBuilder allParamValue = new StringBuilder();
        parameters.forEach((key, value) -> allParamValue.append(value).append("|"));
        allParamValue.append(merchantKey);
        
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(allParamValue.toString().getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }
}
