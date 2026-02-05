package in.main.dto;

import java.util.List;

public class DashboardResponse {

    private double totalRevenue;
    private double inventoryValue;
    private int totalSold;

    private List<ProductResponse> topSellingProducts;
    private List<ProductResponse> fastMovingProducts;
    private List<ProductResponse> lowStockProducts;
    private List<ProductResponse> outOfStockProducts;
    private List<ProductResponse> expiringSoonProducts;
    private List<OrderResponse> recentOrders;

	public double getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(double totalRevenue) {
		this.totalRevenue = totalRevenue;
	}

	public double getInventoryValue() {
		return inventoryValue;
	}

	public void setInventoryValue(double inventoryValue) {
		this.inventoryValue = inventoryValue;
	}

	public int getTotalSold() {
		return totalSold;
	}

	public void setTotalSold(int totalSold) {
		this.totalSold = totalSold;
	}

	public List<ProductResponse> getTopSellingProducts() {
		return topSellingProducts;
	}

	public void setTopSellingProducts(List<ProductResponse> topSellingProducts) {
		this.topSellingProducts = topSellingProducts;
	}

	public List<ProductResponse> getFastMovingProducts() {
		return fastMovingProducts;
	}

	public void setFastMovingProducts(List<ProductResponse> fastMovingProducts) {
		this.fastMovingProducts = fastMovingProducts;
	}

	public List<ProductResponse> getLowStockProducts() {
		return lowStockProducts;
	}

	public void setLowStockProducts(List<ProductResponse> lowStockProducts) {
		this.lowStockProducts = lowStockProducts;
	}

	public List<ProductResponse> getOutOfStockProducts() {
		return outOfStockProducts;
	}

	public void setOutOfStockProducts(List<ProductResponse> outOfStockProducts) {
		this.outOfStockProducts = outOfStockProducts;
	}

	public List<ProductResponse> getExpiringSoonProducts() {
		return expiringSoonProducts;
	}

	public void setExpiringSoonProducts(List<ProductResponse> expiringSoonProducts) {
		this.expiringSoonProducts = expiringSoonProducts;
	}

	public List<OrderResponse> getRecentOrders() {
		return recentOrders;
	}

	public void setRecentOrders(List<OrderResponse> recentOrders) {
		this.recentOrders = recentOrders;
	}
}

