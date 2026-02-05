package in.main.dto;

public class CreateOrderRequest {
    private String planType;
    private Double amount;
    private String provider; // e.g., "razorpay" (default) or "acurato"

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

    public String getProvider() {
        return provider == null ? "razorpay" : provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
