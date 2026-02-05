package in.main.entities;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
	
	public enum Role {
		USER, ADMIN, SUPER_ADMIN
	}
	
	public enum AccountStatus {
		ACTIVE, FROZEN, SUSPENDED, DEACTIVATED
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String fullName;

	@Column(unique = true)
	private String email;

	@Column(unique = true)
	private String phone;
	
	@Column(unique = true, length = 20)
	private String professionalNumber;
	
	@JsonIgnore
	private String passwordHash;

	private String shopName;

	private String shopAddress;
	
	@Column(length = 100)
	private String referredBy;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.USER;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AccountStatus accountStatus = AccountStatus.ACTIVE;
	
	private String freezeReason;
	
	private LocalDateTime frozenAt;
	
	private Long frozenBy;

	private String resetTokenHash;

	private LocalDateTime resetTokenExpiry;
	
	// Payment Integration Fields
	@Column(length = 100)
	private String savedUpiId;
	
	@Column(length = 20)
	private String savedCardNumber;
	
	@Column(length = 100)
	private String savedCardName;
	
	@Column(length = 5)
	private String savedCardExpiry;
	
	@Column(length = 100)
	private String razorpayKeyId;
	
	@Column(length = 100)
	private String razorpayKeySecret;
	
	// Hardware Device Integration Fields
	@Column(nullable = false)
	private Boolean barcodeScannerEnabled = true;
	
	@Column(length = 50)
	private String barcodeScannerType = "keyboard_wedge";
	
	@Column(length = 10)
	private String barcodeScannerPrefix;
	
	@Column(length = 10)
	private String barcodeScannerSuffix = "Enter";
	
	@Column(nullable = false)
	private Boolean thermalPrinterEnabled = true;
	
	@Column(length = 50)
	private String thermalPrinterType = "ESC/POS";
	
	@Column(length = 10)
	private String thermalPrinterWidth = "80mm";
	
	@Column(length = 50)
	private String thermalPrinterPort = "USB";
	
	@Column(nullable = false)
	private Boolean labelPrinterEnabled = false;
	
	@Column(length = 50)
	private String labelPrinterType = "Zebra";
	
	@Column(nullable = false)
	private Boolean weighingScaleEnabled = false;
	
	@Column(length = 10)
	private String weighingScalePort = "COM3";
	
	@Column(nullable = false)
	private Boolean cashDrawerEnabled = false;
	
	@Column(length = 50)
	private String cashDrawerTrigger = "ESC/POS";

	public User() {
	}

	public User(String fullName, String email, String phone, String passwordHash, String shopName, String shopAddress) {
		this.fullName = fullName;
		this.email = email;
		this.phone = phone;
		this.passwordHash = passwordHash;
		this.shopName = shopName;
		this.shopAddress = shopAddress;
		this.role = Role.USER;
		this.accountStatus = AccountStatus.ACTIVE;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getShopName() {
		return shopName;
	}

	public void setShopName(String shopName) {
		this.shopName = shopName;
	}

	public String getShopAddress() {
		return shopAddress;
	}

	public void setShopAddress(String shopAddress) {
		this.shopAddress = shopAddress;
	}

	public String getReferredBy() {
		return referredBy;
	}

	public void setReferredBy(String referredBy) {
		this.referredBy = referredBy;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public AccountStatus getAccountStatus() {
		return accountStatus;
	}

	public void setAccountStatus(AccountStatus accountStatus) {
		this.accountStatus = accountStatus;
	}

	public String getFreezeReason() {
		return freezeReason;
	}

	public void setFreezeReason(String freezeReason) {
		this.freezeReason = freezeReason;
	}

	public LocalDateTime getFrozenAt() {
		return frozenAt;
	}

	public void setFrozenAt(LocalDateTime frozenAt) {
		this.frozenAt = frozenAt;
	}

	public Long getFrozenBy() {
		return frozenBy;
	}

	public void setFrozenBy(Long frozenBy) {
		this.frozenBy = frozenBy;
	}

	public String getProfessionalNumber() {
		return professionalNumber;
	}

	public void setProfessionalNumber(String professionalNumber) {
		this.professionalNumber = professionalNumber;
	}

	public String getResetTokenHash() {
		return resetTokenHash;
	}

	public void setResetTokenHash(String resetTokenHash) {
		this.resetTokenHash = resetTokenHash;
	}

	public LocalDateTime getResetTokenExpiry() {
		return resetTokenExpiry;
	}

	public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
		this.resetTokenExpiry = resetTokenExpiry;
	}

	// Payment Integration Getters and Setters
	public String getSavedUpiId() {
		return savedUpiId;
	}

	public void setSavedUpiId(String savedUpiId) {
		this.savedUpiId = savedUpiId;
	}

	public String getSavedCardNumber() {
		return savedCardNumber;
	}

	public void setSavedCardNumber(String savedCardNumber) {
		this.savedCardNumber = savedCardNumber;
	}

	public String getSavedCardName() {
		return savedCardName;
	}

	public void setSavedCardName(String savedCardName) {
		this.savedCardName = savedCardName;
	}

	public String getSavedCardExpiry() {
		return savedCardExpiry;
	}

	public void setSavedCardExpiry(String savedCardExpiry) {
		this.savedCardExpiry = savedCardExpiry;
	}

	public String getRazorpayKeyId() {
		return razorpayKeyId;
	}

	public void setRazorpayKeyId(String razorpayKeyId) {
		this.razorpayKeyId = razorpayKeyId;
	}

	public String getRazorpayKeySecret() {
		return razorpayKeySecret;
	}

	public void setRazorpayKeySecret(String razorpayKeySecret) {
		this.razorpayKeySecret = razorpayKeySecret;
	}

	// Hardware Device Integration Getters and Setters
	public Boolean getBarcodeScannerEnabled() {
		return barcodeScannerEnabled;
	}

	public void setBarcodeScannerEnabled(Boolean barcodeScannerEnabled) {
		this.barcodeScannerEnabled = barcodeScannerEnabled;
	}

	public String getBarcodeScannerType() {
		return barcodeScannerType;
	}

	public void setBarcodeScannerType(String barcodeScannerType) {
		this.barcodeScannerType = barcodeScannerType;
	}

	public String getBarcodeScannerPrefix() {
		return barcodeScannerPrefix;
	}

	public void setBarcodeScannerPrefix(String barcodeScannerPrefix) {
		this.barcodeScannerPrefix = barcodeScannerPrefix;
	}

	public String getBarcodeScannerSuffix() {
		return barcodeScannerSuffix;
	}

	public void setBarcodeScannerSuffix(String barcodeScannerSuffix) {
		this.barcodeScannerSuffix = barcodeScannerSuffix;
	}

	public Boolean getThermalPrinterEnabled() {
		return thermalPrinterEnabled;
	}

	public void setThermalPrinterEnabled(Boolean thermalPrinterEnabled) {
		this.thermalPrinterEnabled = thermalPrinterEnabled;
	}

	public String getThermalPrinterType() {
		return thermalPrinterType;
	}

	public void setThermalPrinterType(String thermalPrinterType) {
		this.thermalPrinterType = thermalPrinterType;
	}

	public String getThermalPrinterWidth() {
		return thermalPrinterWidth;
	}

	public void setThermalPrinterWidth(String thermalPrinterWidth) {
		this.thermalPrinterWidth = thermalPrinterWidth;
	}

	public String getThermalPrinterPort() {
		return thermalPrinterPort;
	}

	public void setThermalPrinterPort(String thermalPrinterPort) {
		this.thermalPrinterPort = thermalPrinterPort;
	}

	public Boolean getLabelPrinterEnabled() {
		return labelPrinterEnabled;
	}

	public void setLabelPrinterEnabled(Boolean labelPrinterEnabled) {
		this.labelPrinterEnabled = labelPrinterEnabled;
	}

	public String getLabelPrinterType() {
		return labelPrinterType;
	}

	public void setLabelPrinterType(String labelPrinterType) {
		this.labelPrinterType = labelPrinterType;
	}

	public Boolean getWeighingScaleEnabled() {
		return weighingScaleEnabled;
	}

	public void setWeighingScaleEnabled(Boolean weighingScaleEnabled) {
		this.weighingScaleEnabled = weighingScaleEnabled;
	}

	public String getWeighingScalePort() {
		return weighingScalePort;
	}

	public void setWeighingScalePort(String weighingScalePort) {
		this.weighingScalePort = weighingScalePort;
	}

	public Boolean getCashDrawerEnabled() {
		return cashDrawerEnabled;
	}

	public void setCashDrawerEnabled(Boolean cashDrawerEnabled) {
		this.cashDrawerEnabled = cashDrawerEnabled;
	}

	public String getCashDrawerTrigger() {
		return cashDrawerTrigger;
	}

	public void setCashDrawerTrigger(String cashDrawerTrigger) {
		this.cashDrawerTrigger = cashDrawerTrigger;
	}
}