package in.main.dto;

public class OrderResponse {

    private Long id;
    private String customer;
    private String date;
    private Integer items;
    private Double total;
    private Double mrpTotal;
    private Double discount;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getCustomer() {
		return customer;
	}
	public void setCustomer(String customer) {
		this.customer = customer;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
public Integer getItems() {
        return items;
    }
    public void setItems(Integer items) {
        this.items = items;
    }
    public Double getTotal() {
        return total;
    }
    public void setTotal(Double total) {
        this.total = total;
    }

    public Double getMrpTotal() {
        return mrpTotal;
    }

    public void setMrpTotal(Double mrpTotal) {
        this.mrpTotal = mrpTotal;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
	}

}

