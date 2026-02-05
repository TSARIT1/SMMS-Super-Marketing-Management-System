package in.main.dto;

import java.util.List;

public class OrderRequest {

    private String customerName;
    private double totalAmount;
    private String paymentMethod;
    private List<OrderItemRequest> items;

    public String getCustomerName() {
        return customerName;
    }

    public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public void setItems(List<OrderItemRequest> items) {
		this.items = items;
	}

	public double getTotalAmount() {
        return totalAmount;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }
}

