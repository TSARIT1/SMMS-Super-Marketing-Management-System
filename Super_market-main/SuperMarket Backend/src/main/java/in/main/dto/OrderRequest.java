package in.main.dto;

import java.util.List;

public class OrderRequest {

    private String customerName;
    private String customerPhone;
    private double totalAmount;
    private double taxAmount;
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

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(double taxAmount) {
        this.taxAmount = taxAmount;
    }
}

