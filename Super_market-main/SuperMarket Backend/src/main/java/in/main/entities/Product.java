package in.main.entities;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(
	    name = "product",
	    uniqueConstraints = {
	        @UniqueConstraint(columnNames = {"user_id", "product_code"})
	    },
	    indexes = {
	        @Index(name = "idx_product_user", columnList = "user_id")
	    }
	)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;
	private String productCode;


	public String getProductCode() {
		return productCode;
	}
	public void setProductCode(String productCode) {
		this.productCode = productCode;
	}
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	private String barcode;
	
	@ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
	private List<String> offers;

    private String name;
    private String category;
    private String supplier;
    private LocalDate expiryDate;
    private LocalDate lastUpdated;
    @Builder.Default
    @Column(nullable = false)
    private Integer quantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double price = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer sold = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer minStock = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean published = false;

    // Per-item tax rate (percentage, e.g., 5.0 for 5%, 18.0 for 18%)
    @Builder.Default
    @Column(nullable = false)
    private Double taxRate = 0.0;

    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public Integer getMinStock() {
		return minStock;
	}
	public void setMinStock(Integer minStock) {
		this.minStock = minStock;
	}
	public String getSupplier() {
		return supplier;
	}
	public void setSupplier(String supplier) {
		this.supplier = supplier;
	}
	public LocalDate getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(LocalDate expiryDate) {
		this.expiryDate = expiryDate;
	}
	public Boolean getPublished() {
		return published;
	}
	public void setPublished(Boolean published) {
		this.published = published;
	}
	public Integer getSold() {
		return sold;
	}
	public void setSold(Integer sold) {
		this.sold = sold;
	}
	public LocalDate getLastUpdated() {
		return lastUpdated;
	}
	public void setLastUpdated(LocalDate localDate) {
		this.lastUpdated = localDate;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public String getBarcode() {
		return barcode;
	}
	public void setBarcode(String barcode) {
		this.barcode = barcode;
	}
	public List<String> getOffers() {
		return offers;
	}
	public void setOffers(List<String> offers) {
		this.offers = offers;
	}
	public Double getTaxRate() {
		return taxRate;
	}
	public void setTaxRate(Double taxRate) {
		this.taxRate = taxRate;
	}
    
    @Column(name = "net_rate")
    private Double netRate;

    public Double getNetRate() {
        return netRate;
    }

    public void setNetRate(Double netRate) {
        this.netRate = netRate;
    }

    // JSON compatibility for frontend (uses `netPrice`).
    @JsonProperty("netPrice")
    public Double getNetPrice() {
        return this.netRate;
    }

    @JsonProperty("netPrice")
    public void setNetPrice(Double netPrice) {
        this.netRate = netPrice;
    }
}

