package in.main.dto;

import java.util.List;

public class PaymentInitiateRequest {
    
    private String gateway; // razorpay, paytm, phonepe, payu
    private Double amount;
    private String currency;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private List<OrderItemRequest> items;
    private Long userId;
    
    public String getGateway() {
        return gateway;
    }
    public void setGateway(String gateway) {
        this.gateway = gateway;
    }
    public Double getAmount() {
        return amount;
    }
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public String getCustomerName() {
        return customerName;
    }
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    public String getCustomerEmail() {
        return customerEmail;
    }
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    public String getCustomerPhone() {
        return customerPhone;
    }
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    public List<OrderItemRequest> getItems() {
        return items;
    }
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
