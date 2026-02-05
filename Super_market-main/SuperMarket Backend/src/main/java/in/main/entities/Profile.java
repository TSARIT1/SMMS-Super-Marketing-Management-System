package in.main.entities;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String shopName;
    private String shopType;
    private String tagline;
    private String establishedYear;

    private String shopAddress;
    private String phoneNumber;
    private String email;
    private String website;

    private String openingTime;
    private String closingTime;
    private String workingDays;

    private boolean deliveryAvailable;
    private boolean homeDelivery;
    private boolean parkingAvailable;
    private boolean acceptsOnlineOrders;

    private String bankAccountName;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private String upiId;

    private String gstNumber;
    private String tinNumber;
    private String panNumber;
    private String cinNumber;

    @Column(length = 1000)
    private String discountOffers;

    @ElementCollection
    @CollectionTable(name = "profile_payment_methods", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "payment_method")
    private List<String> acceptedPaymentMethods;

    @ElementCollection
    @CollectionTable(name = "profile_product_categories", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "category")
    private List<String> productCategories;

    private String facebook;
    private String instagram;
    private String googleBusinessRating;

    private String storeArea;
    private String employeesCount;
    
    // Tax Configuration
    private Double taxRate = 10.0; // Tax rate in percentage (default 10%)
    private Boolean gstEnabled = true;

    // Payment Gateway Configuration - Paytm
    private String paytmMerchantId;
    private String paytmMerchantKey;
    private String paytmWebhookUrl;
    private Boolean paytmEnabled = false;

    // Payment Gateway Configuration - PhonePe
    private String phonepeMerchantId;
    private String phonepeSaltKey;
    private String phonepeSaltIndex;
    private Boolean phonepeEnabled = false;

    // Payment Gateway Configuration - Razorpay
    private String razorpayKeyId;
    private String razorpayKeySecret;
    private String razorpayWebhookSecret;
    private Boolean razorpayEnabled = false;

    // Payment Gateway Configuration - PayU Money
    private String payuMerchantKey;
    private String payuSalt;
    private Boolean payuEnabled = false;

    // AI Configuration
    private String aiMode = "manual"; // "manual" or "auto"
    private Boolean aiEnabled = true;
    private Boolean voiceAiEnabled = true;
    private Boolean autoInventoryManagement = false;
    private Boolean autoOrderProcessing = false;
    private Boolean aiLoadBalancing = true;

    // Billing Configuration
    private String billingMode = "manual"; // "manual" or "ai"
    private Boolean autoBillingConfirm = false;
    private String paperSize = "80mm"; // "58mm", "80mm", "A4", "A5"

    // ✅ FILE PATHS (CORRECT)
    private String profilePhoto;
    private String qrCode;

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
	public String getShopName() {
		return shopName;
	}
	public void setShopName(String shopName) {
		this.shopName = shopName;
	}
	public String getShopType() {
		return shopType;
	}
	public void setShopType(String shopType) {
		this.shopType = shopType;
	}
	public String getTagline() {
		return tagline;
	}
	public void setTagline(String tagline) {
		this.tagline = tagline;
	}
	public String getEstablishedYear() {
		return establishedYear;
	}
	public void setEstablishedYear(String establishedYear) {
		this.establishedYear = establishedYear;
	}
	public String getShopAddress() {
		return shopAddress;
	}
	public void setShopAddress(String shopAddress) {
		this.shopAddress = shopAddress;
	}
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getWebsite() {
		return website;
	}
	public void setWebsite(String website) {
		this.website = website;
	}
	public String getOpeningTime() {
		return openingTime;
	}
	public void setOpeningTime(String openingTime) {
		this.openingTime = openingTime;
	}
	public String getClosingTime() {
		return closingTime;
	}
	public void setClosingTime(String closingTime) {
		this.closingTime = closingTime;
	}
	public String getWorkingDays() {
		return workingDays;
	}
	public void setWorkingDays(String workingDays) {
		this.workingDays = workingDays;
	}
	public boolean isDeliveryAvailable() {
		return deliveryAvailable;
	}
	public void setDeliveryAvailable(boolean deliveryAvailable) {
		this.deliveryAvailable = deliveryAvailable;
	}
	public boolean isHomeDelivery() {
		return homeDelivery;
	}
	public void setHomeDelivery(boolean homeDelivery) {
		this.homeDelivery = homeDelivery;
	}
	public boolean isParkingAvailable() {
		return parkingAvailable;
	}
	public void setParkingAvailable(boolean parkingAvailable) {
		this.parkingAvailable = parkingAvailable;
	}
	public boolean isAcceptsOnlineOrders() {
		return acceptsOnlineOrders;
	}
	public void setAcceptsOnlineOrders(boolean acceptsOnlineOrders) {
		this.acceptsOnlineOrders = acceptsOnlineOrders;
	}
	public String getBankAccountName() {
		return bankAccountName;
	}
	public void setBankAccountName(String bankAccountName) {
		this.bankAccountName = bankAccountName;
	}
	public String getBankAccountNumber() {
		return bankAccountNumber;
	}
	public void setBankAccountNumber(String bankAccountNumber) {
		this.bankAccountNumber = bankAccountNumber;
	}
	public String getBankName() {
		return bankName;
	}
	public void setBankName(String bankName) {
		this.bankName = bankName;
	}
	public String getIfscCode() {
		return ifscCode;
	}
	public void setIfscCode(String ifscCode) {
		this.ifscCode = ifscCode;
	}
	public String getUpiId() {
		return upiId;
	}
	public void setUpiId(String upiId) {
		this.upiId = upiId;
	}
	public String getGstNumber() {
		return gstNumber;
	}
	public void setGstNumber(String gstNumber) {
		this.gstNumber = gstNumber;
	}
	public String getTinNumber() {
		return tinNumber;
	}
	public void setTinNumber(String tinNumber) {
		this.tinNumber = tinNumber;
	}
	public String getPanNumber() {
		return panNumber;
	}
	public void setPanNumber(String panNumber) {
		this.panNumber = panNumber;
	}
	public String getCinNumber() {
		return cinNumber;
	}
	public void setCinNumber(String cinNumber) {
		this.cinNumber = cinNumber;
	}
	public String getDiscountOffers() {
		return discountOffers;
	}
	public void setDiscountOffers(String discountOffers) {
		this.discountOffers = discountOffers;
	}
	public List<String> getAcceptedPaymentMethods() {
		return acceptedPaymentMethods;
	}
	public void setAcceptedPaymentMethods(List<String> acceptedPaymentMethods) {
		this.acceptedPaymentMethods = acceptedPaymentMethods;
	}
	public List<String> getProductCategories() {
		return productCategories;
	}
	public void setProductCategories(List<String> productCategories) {
		this.productCategories = productCategories;
	}
	public String getFacebook() {
		return facebook;
	}
	public void setFacebook(String facebook) {
		this.facebook = facebook;
	}
	public String getInstagram() {
		return instagram;
	}
	public void setInstagram(String instagram) {
		this.instagram = instagram;
	}
	public String getGoogleBusinessRating() {
		return googleBusinessRating;
	}
	public void setGoogleBusinessRating(String googleBusinessRating) {
		this.googleBusinessRating = googleBusinessRating;
	}
	public String getStoreArea() {
		return storeArea;
	}
	public void setStoreArea(String storeArea) {
		this.storeArea = storeArea;
	}
	public String getEmployeesCount() {
		return employeesCount;
	}
	public void setEmployeesCount(String employeesCount) {
		this.employeesCount = employeesCount;
	}

	// Tax Configuration Getters & Setters
	public Double getTaxRate() {
		return taxRate;
	}
	public void setTaxRate(Double taxRate) {
		this.taxRate = taxRate;
	}
	public Boolean getGstEnabled() {
		return gstEnabled;
	}
	public void setGstEnabled(Boolean gstEnabled) {
		this.gstEnabled = gstEnabled;
	}

	// Paytm Getters & Setters
	public String getPaytmMerchantId() {
		return paytmMerchantId;
	}
	public void setPaytmMerchantId(String paytmMerchantId) {
		this.paytmMerchantId = paytmMerchantId;
	}
	public String getPaytmMerchantKey() {
		return paytmMerchantKey;
	}
	public void setPaytmMerchantKey(String paytmMerchantKey) {
		this.paytmMerchantKey = paytmMerchantKey;
	}
	public String getPaytmWebhookUrl() {
		return paytmWebhookUrl;
	}
	public void setPaytmWebhookUrl(String paytmWebhookUrl) {
		this.paytmWebhookUrl = paytmWebhookUrl;
	}
	public Boolean getPaytmEnabled() {
		return paytmEnabled;
	}
	public void setPaytmEnabled(Boolean paytmEnabled) {
		this.paytmEnabled = paytmEnabled;
	}

	// PhonePe Getters & Setters
	public String getPhonepeMerchantId() {
		return phonepeMerchantId;
	}
	public void setPhonepeMerchantId(String phonepeMerchantId) {
		this.phonepeMerchantId = phonepeMerchantId;
	}
	public String getPhonepeSaltKey() {
		return phonepeSaltKey;
	}
	public void setPhonepeSaltKey(String phonepeSaltKey) {
		this.phonepeSaltKey = phonepeSaltKey;
	}
	public String getPhonepeSaltIndex() {
		return phonepeSaltIndex;
	}
	public void setPhonepeSaltIndex(String phonepeSaltIndex) {
		this.phonepeSaltIndex = phonepeSaltIndex;
	}
	public Boolean getPhonepeEnabled() {
		return phonepeEnabled;
	}
	public void setPhonepeEnabled(Boolean phonepeEnabled) {
		this.phonepeEnabled = phonepeEnabled;
	}

	// Razorpay Getters & Setters
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
	public String getRazorpayWebhookSecret() {
		return razorpayWebhookSecret;
	}
	public void setRazorpayWebhookSecret(String razorpayWebhookSecret) {
		this.razorpayWebhookSecret = razorpayWebhookSecret;
	}
	public Boolean getRazorpayEnabled() {
		return razorpayEnabled;
	}
	public void setRazorpayEnabled(Boolean razorpayEnabled) {
		this.razorpayEnabled = razorpayEnabled;
	}

	// PayU Money Getters & Setters
	public String getPayuMerchantKey() {
		return payuMerchantKey;
	}
	public void setPayuMerchantKey(String payuMerchantKey) {
		this.payuMerchantKey = payuMerchantKey;
	}
	public String getPayuSalt() {
		return payuSalt;
	}
	public void setPayuSalt(String payuSalt) {
		this.payuSalt = payuSalt;
	}
	public Boolean getPayuEnabled() {
		return payuEnabled;
	}
	public void setPayuEnabled(Boolean payuEnabled) {
		this.payuEnabled = payuEnabled;
	}

	// AI Configuration Getters & Setters
	public String getAiMode() {
		return aiMode;
	}
	public void setAiMode(String aiMode) {
		this.aiMode = aiMode;
	}
	public Boolean getAiEnabled() {
		return aiEnabled;
	}
	public void setAiEnabled(Boolean aiEnabled) {
		this.aiEnabled = aiEnabled;
	}
	public Boolean getVoiceAiEnabled() {
		return voiceAiEnabled;
	}
	public void setVoiceAiEnabled(Boolean voiceAiEnabled) {
		this.voiceAiEnabled = voiceAiEnabled;
	}
	public Boolean getAutoInventoryManagement() {
		return autoInventoryManagement;
	}
	public void setAutoInventoryManagement(Boolean autoInventoryManagement) {
		this.autoInventoryManagement = autoInventoryManagement;
	}
	public Boolean getAutoOrderProcessing() {
		return autoOrderProcessing;
	}
	public void setAutoOrderProcessing(Boolean autoOrderProcessing) {
		this.autoOrderProcessing = autoOrderProcessing;
	}
	public Boolean getAiLoadBalancing() {
		return aiLoadBalancing;
	}
	public void setAiLoadBalancing(Boolean aiLoadBalancing) {
		this.aiLoadBalancing = aiLoadBalancing;
	}

	// Billing Configuration Getters & Setters
	public String getBillingMode() {
		return billingMode;
	}
	public void setBillingMode(String billingMode) {
		this.billingMode = billingMode;
	}
	public Boolean getAutoBillingConfirm() {
		return autoBillingConfirm;
	}
	public void setAutoBillingConfirm(Boolean autoBillingConfirm) {
		this.autoBillingConfirm = autoBillingConfirm;
	}
	public String getPaperSize() {
		return paperSize;
	}
	public void setPaperSize(String paperSize) {
		this.paperSize = paperSize;
	}


}