package in.main.dto;

public class PaymentVerificationRequest {
    private String razorpay_payment_id;
    private String razorpay_order_id;
    private String razorpay_signature;

    // Acurato fields (alternative provider)
    private String acurato_payment_id;
    private String acurato_order_id;
    private String acurato_signature;

    private String planType;
    private Double amount;
    private String provider; // optional, defaults to "razorpay"

    public String getRazorpay_payment_id() {
        return razorpay_payment_id;
    }

    public void setRazorpay_payment_id(String razorpay_payment_id) {
        this.razorpay_payment_id = razorpay_payment_id;
    }

    public String getRazorpay_order_id() {
        return razorpay_order_id;
    }

    public void setRazorpay_order_id(String razorpay_order_id) {
        this.razorpay_order_id = razorpay_order_id;
    }

    public String getRazorpay_signature() {
        return razorpay_signature;
    }

    public void setRazorpay_signature(String razorpay_signature) {
        this.razorpay_signature = razorpay_signature;
    }

    public String getAcurato_payment_id() {
        return acurato_payment_id;
    }

    public void setAcurato_payment_id(String acurato_payment_id) {
        this.acurato_payment_id = acurato_payment_id;
    }

    public String getAcurato_order_id() {
        return acurato_order_id;
    }

    public void setAcurato_order_id(String acurato_order_id) {
        this.acurato_order_id = acurato_order_id;
    }

    public String getAcurato_signature() {
        return acurato_signature;
    }

    public void setAcurato_signature(String acurato_signature) {
        this.acurato_signature = acurato_signature;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getProvider() { return provider == null ? "razorpay" : provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
