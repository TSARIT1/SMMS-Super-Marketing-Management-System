package in.main.service.payment;

import in.main.dto.PaymentInitiateRequest;
import in.main.dto.PaymentInitiateResponse;
import in.main.entities.Profile;

public interface PaymentGatewayService {
    
    /**
     * Initiate a payment with the gateway
     */
    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Profile profile);
    
    /**
     * Verify webhook signature
     */
    boolean verifyWebhookSignature(String payload, String signature, Profile profile);
    
    /**
     * Get gateway name
     */
    String getGatewayName();
    
    /**
     * Check if gateway is enabled for the user
     */
    boolean isEnabled(Profile profile);
}
