package in.main.dto;

public class PaymentInitiateResponse {
    
    private String status; // success, error
    private String message;
    private String orderId; // Gateway order ID
    private String paymentUrl; // Redirect URL for payment
    private Object gatewayData; // Gateway-specific data (Razorpay options, Paytm token, etc.)
    
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getOrderId() {
        return orderId;
    }
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    public String getPaymentUrl() {
        return paymentUrl;
    }
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
    public Object getGatewayData() {
        return gatewayData;
    }
    public void setGatewayData(Object gatewayData) {
        this.gatewayData = gatewayData;
    }
}
