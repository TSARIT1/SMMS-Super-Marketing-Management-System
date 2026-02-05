package in.main.dto;

import java.util.List;

public class ProfileResponse {

    private String shop_name;
    private String shop_type;
    private String tagline;
    private String established_year;

    private String shop_address;
    private String phone_number;
    private String email;
    private String website;

    private String opening_time;
    private String closing_time;
    private String working_days;

    private boolean delivery_available;
    private boolean home_delivery;
    private boolean parking_available;
    private boolean accepts_online_orders;

    private String bank_account_name;
    private String bank_account_number;
    private String bank_name;
    private String ifsc_code;
    private String upi_id;

    private String gst_number;
    private String tin_number;
    private String pan_number;
    private String cin_number;

    private String discount_offers;

    private List<String> accepted_payment_methods;
    private List<String> product_categories;

    private String facebook;
    private String instagram;
    private String google_business_rating;

    private String store_area;
    private String employees_count;

    private String profile_photo;
    private String qr_code;
    
    private String professional_number;
    
    // Tax Configuration
    private Double tax_rate;
    private Boolean gst_enabled;

    // Payment Gateway Configuration - Paytm
    private String paytm_merchant_id;
    private String paytm_merchant_key;
    private String paytm_webhook_url;
    private Boolean paytm_enabled;

    // Payment Gateway Configuration - PhonePe
    private String phonepe_merchant_id;
    private String phonepe_salt_key;
    private String phonepe_salt_index;
    private Boolean phonepe_enabled;

    // Payment Gateway Configuration - Razorpay
    private String razorpay_key_id;
    private String razorpay_key_secret;
    private String razorpay_webhook_secret;
    private Boolean razorpay_enabled;

    // Payment Gateway Configuration - PayU Money
    private String payu_merchant_key;
    private String payu_salt;
    private Boolean payu_enabled;

    // AI Configuration
    private String ai_mode;
    private Boolean ai_enabled;
    private Boolean voice_ai_enabled;
    private Boolean auto_inventory_management;
    private Boolean auto_order_processing;
    private Boolean ai_load_balancing;

    // Billing Configuration
    private String billing_mode;
    private Boolean auto_billing_confirm;
    private String paper_size;
    
	public String getShop_name() {
		return shop_name;
	}
	public void setShop_name(String shop_name) {
		this.shop_name = shop_name;
	}
	public String getShop_type() {
		return shop_type;
	}
	public void setShop_type(String shop_type) {
		this.shop_type = shop_type;
	}
	public String getTagline() {
		return tagline;
	}
	public void setTagline(String tagline) {
		this.tagline = tagline;
	}
	public String getEstablished_year() {
		return established_year;
	}
	public void setEstablished_year(String established_year) {
		this.established_year = established_year;
	}
	public String getShop_address() {
		return shop_address;
	}
	public void setShop_address(String shop_address) {
		this.shop_address = shop_address;
	}
	public String getPhone_number() {
		return phone_number;
	}
	public void setPhone_number(String phone_number) {
		this.phone_number = phone_number;
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
	public String getOpening_time() {
		return opening_time;
	}
	public void setOpening_time(String opening_time) {
		this.opening_time = opening_time;
	}
	public String getClosing_time() {
		return closing_time;
	}
	public void setClosing_time(String closing_time) {
		this.closing_time = closing_time;
	}
	public String getWorking_days() {
		return working_days;
	}
	public void setWorking_days(String working_days) {
		this.working_days = working_days;
	}
	public boolean isDelivery_available() {
		return delivery_available;
	}
	public void setDelivery_available(boolean delivery_available) {
		this.delivery_available = delivery_available;
	}
	public boolean isHome_delivery() {
		return home_delivery;
	}
	public void setHome_delivery(boolean home_delivery) {
		this.home_delivery = home_delivery;
	}
	public boolean isParking_available() {
		return parking_available;
	}
	public void setParking_available(boolean parking_available) {
		this.parking_available = parking_available;
	}
	public boolean isAccepts_online_orders() {
		return accepts_online_orders;
	}
	public void setAccepts_online_orders(boolean accepts_online_orders) {
		this.accepts_online_orders = accepts_online_orders;
	}
	public String getBank_account_name() {
		return bank_account_name;
	}
	public void setBank_account_name(String bank_account_name) {
		this.bank_account_name = bank_account_name;
	}
	public String getBank_account_number() {
		return bank_account_number;
	}
	public void setBank_account_number(String bank_account_number) {
		this.bank_account_number = bank_account_number;
	}
	public String getBank_name() {
		return bank_name;
	}
	public void setBank_name(String bank_name) {
		this.bank_name = bank_name;
	}
	public String getIfsc_code() {
		return ifsc_code;
	}
	public void setIfsc_code(String ifsc_code) {
		this.ifsc_code = ifsc_code;
	}
	public String getUpi_id() {
		return upi_id;
	}
	public void setUpi_id(String upi_id) {
		this.upi_id = upi_id;
	}
	public String getGst_number() {
		return gst_number;
	}
	public void setGst_number(String gst_number) {
		this.gst_number = gst_number;
	}
	public String getTin_number() {
		return tin_number;
	}
	public void setTin_number(String tin_number) {
		this.tin_number = tin_number;
	}
	public String getPan_number() {
		return pan_number;
	}
	public void setPan_number(String pan_number) {
		this.pan_number = pan_number;
	}
	public String getCin_number() {
		return cin_number;
	}
	public void setCin_number(String cin_number) {
		this.cin_number = cin_number;
	}
	public String getDiscount_offers() {
		return discount_offers;
	}
	public void setDiscount_offers(String discount_offers) {
		this.discount_offers = discount_offers;
	}
	public List<String> getAccepted_payment_methods() {
		return accepted_payment_methods;
	}
	public void setAccepted_payment_methods(List<String> accepted_payment_methods) {
		this.accepted_payment_methods = accepted_payment_methods;
	}
	public List<String> getProduct_categories() {
		return product_categories;
	}
	public void setProduct_categories(List<String> product_categories) {
		this.product_categories = product_categories;
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
	public String getGoogle_business_rating() {
		return google_business_rating;
	}
	public void setGoogle_business_rating(String google_business_rating) {
		this.google_business_rating = google_business_rating;
	}
	public String getStore_area() {
		return store_area;
	}
	public void setStore_area(String store_area) {
		this.store_area = store_area;
	}
	public String getEmployees_count() {
		return employees_count;
	}
	public void setEmployees_count(String employees_count) {
		this.employees_count = employees_count;
	}
	public String getProfile_photo() {
		return profile_photo;
	}
	public void setProfile_photo(String profile_photo) {
		this.profile_photo = profile_photo;
	}
	public String getQr_code() {
		return qr_code;
	}
	public void setQr_code(String qr_code) {
		this.qr_code = qr_code;
	}
	public String getProfessional_number() {
		return professional_number;
	}
	public void setProfessional_number(String professional_number) {
		this.professional_number = professional_number;
	}
	
	// Tax Configuration Getters & Setters
	public Double getTax_rate() {
		return tax_rate;
	}
	public void setTax_rate(Double tax_rate) {
		this.tax_rate = tax_rate;
	}
	public Boolean getGst_enabled() {
		return gst_enabled;
	}
	public void setGst_enabled(Boolean gst_enabled) {
		this.gst_enabled = gst_enabled;
	}

	// Paytm Getters & Setters
	public String getPaytm_merchant_id() {
		return paytm_merchant_id;
	}
	public void setPaytm_merchant_id(String paytm_merchant_id) {
		this.paytm_merchant_id = paytm_merchant_id;
	}
	public String getPaytm_merchant_key() {
		return paytm_merchant_key;
	}
	public void setPaytm_merchant_key(String paytm_merchant_key) {
		this.paytm_merchant_key = paytm_merchant_key;
	}
	public String getPaytm_webhook_url() {
		return paytm_webhook_url;
	}
	public void setPaytm_webhook_url(String paytm_webhook_url) {
		this.paytm_webhook_url = paytm_webhook_url;
	}
	public Boolean getPaytm_enabled() {
		return paytm_enabled;
	}
	public void setPaytm_enabled(Boolean paytm_enabled) {
		this.paytm_enabled = paytm_enabled;
	}

	// PhonePe Getters & Setters
	public String getPhonepe_merchant_id() {
		return phonepe_merchant_id;
	}
	public void setPhonepe_merchant_id(String phonepe_merchant_id) {
		this.phonepe_merchant_id = phonepe_merchant_id;
	}
	public String getPhonepe_salt_key() {
		return phonepe_salt_key;
	}
	public void setPhonepe_salt_key(String phonepe_salt_key) {
		this.phonepe_salt_key = phonepe_salt_key;
	}
	public String getPhonepe_salt_index() {
		return phonepe_salt_index;
	}
	public void setPhonepe_salt_index(String phonepe_salt_index) {
		this.phonepe_salt_index = phonepe_salt_index;
	}
	public Boolean getPhonepe_enabled() {
		return phonepe_enabled;
	}
	public void setPhonepe_enabled(Boolean phonepe_enabled) {
		this.phonepe_enabled = phonepe_enabled;
	}

	// Razorpay Getters & Setters
	public String getRazorpay_key_id() {
		return razorpay_key_id;
	}
	public void setRazorpay_key_id(String razorpay_key_id) {
		this.razorpay_key_id = razorpay_key_id;
	}
	public String getRazorpay_key_secret() {
		return razorpay_key_secret;
	}
	public void setRazorpay_key_secret(String razorpay_key_secret) {
		this.razorpay_key_secret = razorpay_key_secret;
	}
	public String getRazorpay_webhook_secret() {
		return razorpay_webhook_secret;
	}
	public void setRazorpay_webhook_secret(String razorpay_webhook_secret) {
		this.razorpay_webhook_secret = razorpay_webhook_secret;
	}
	public Boolean getRazorpay_enabled() {
		return razorpay_enabled;
	}
	public void setRazorpay_enabled(Boolean razorpay_enabled) {
		this.razorpay_enabled = razorpay_enabled;
	}

	// PayU Money Getters & Setters
	public String getPayu_merchant_key() {
		return payu_merchant_key;
	}
	public void setPayu_merchant_key(String payu_merchant_key) {
		this.payu_merchant_key = payu_merchant_key;
	}
	public String getPayu_salt() {
		return payu_salt;
	}
	public void setPayu_salt(String payu_salt) {
		this.payu_salt = payu_salt;
	}
	public Boolean getPayu_enabled() {
		return payu_enabled;
	}
	public void setPayu_enabled(Boolean payu_enabled) {
		this.payu_enabled = payu_enabled;
	}

	// AI Configuration Getters & Setters
	public String getAi_mode() {
		return ai_mode;
	}
	public void setAi_mode(String ai_mode) {
		this.ai_mode = ai_mode;
	}
	public Boolean getAi_enabled() {
		return ai_enabled;
	}
	public void setAi_enabled(Boolean ai_enabled) {
		this.ai_enabled = ai_enabled;
	}
	public Boolean getVoice_ai_enabled() {
		return voice_ai_enabled;
	}
	public void setVoice_ai_enabled(Boolean voice_ai_enabled) {
		this.voice_ai_enabled = voice_ai_enabled;
	}
	public Boolean getAuto_inventory_management() {
		return auto_inventory_management;
	}
	public void setAuto_inventory_management(Boolean auto_inventory_management) {
		this.auto_inventory_management = auto_inventory_management;
	}
	public Boolean getAuto_order_processing() {
		return auto_order_processing;
	}
	public void setAuto_order_processing(Boolean auto_order_processing) {
		this.auto_order_processing = auto_order_processing;
	}
	public Boolean getAi_load_balancing() {
		return ai_load_balancing;
	}
	public void setAi_load_balancing(Boolean ai_load_balancing) {
		this.ai_load_balancing = ai_load_balancing;
	}

	// Billing Configuration Getters & Setters
	public String getBilling_mode() {
		return billing_mode;
	}
	public void setBilling_mode(String billing_mode) {
		this.billing_mode = billing_mode;
	}
	public Boolean getAuto_billing_confirm() {
		return auto_billing_confirm;
	}
	public void setAuto_billing_confirm(Boolean auto_billing_confirm) {
		this.auto_billing_confirm = auto_billing_confirm;
	}
	public String getPaper_size() {
		return paper_size;
	}
	public void setPaper_size(String paper_size) {
		this.paper_size = paper_size;
	}
    
}