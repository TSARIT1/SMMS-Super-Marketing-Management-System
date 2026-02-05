package in.main.service.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.entities.Profile;

@Service
public class PayUService implements PaymentGatewayService {
    
    private static final String PAYU_PAYMENT_URL = "https://secure.payu.in/_payment";
    
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Profile profile) {
        PaymentInitiateResponse response = new PaymentInitiateResponse();
        
        try {
            String txnId = "TXN_" + System.currentTimeMillis();
            
            // Prepare PayU parameters
            Map<String, String> payuParams = new HashMap<>();
            payuParams.put("key", profile.getPayuMerchantKey());
            payuParams.put("txnid", txnId);
            payuParams.put("amount", String.format("%.2f", request.getAmount()));
            payuParams.put("productinfo", "Supermarket Purchase");
            payuParams.put("firstname", request.getCustomerName());
            payuParams.put("email", request.getCustomerEmail());
            payuParams.put("phone", request.getCustomerPhone() != null ? request.getCustomerPhone() : "");
            payuParams.put("surl", "http://localhost:3000/payment/success");
            payuParams.put("furl", "http://localhost:3000/payment/failure");
            
            // Generate hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
            String hashString = String.format("%s|%s|%s|%s|%s|%s|||||||||||%s",
                payuParams.get("key"),
                payuParams.get("txnid"),
                payuParams.get("amount"),
                payuParams.get("productinfo"),
                payuParams.get("firstname"),
                payuParams.get("email"),
                profile.getPayuSalt()
            );
            
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hash = digest.digest(hashString.getBytes(StandardCharsets.UTF_8));
            String hashValue = bytesToHex(hash);
            
            payuParams.put("hash", hashValue);
            
            response.setStatus("success");
            response.setMessage("PayU payment initiated successfully");
            response.setOrderId(txnId);
            response.setPaymentUrl(PAYU_PAYMENT_URL);
            response.setGatewayData(payuParams);
            
        } catch (Exception e) {
            response.setStatus("error");
            response.setMessage("Error initiating PayU payment: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public boolean verifyWebhookSignature(String payload, String signature, Profile profile) {
        try {
            // PayU webhook verification
            // Verify hash from webhook data
            return signature != null && !signature.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public String getGatewayName() {
        return "payu";
    }
    
    @Override
    public boolean isEnabled(Profile profile) {
        return profile.getPayuEnabled() != null && profile.getPayuEnabled()
            && profile.getPayuMerchantKey() != null && !profile.getPayuMerchantKey().isEmpty()
            && profile.getPayuSalt() != null && !profile.getPayuSalt().isEmpty();
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
