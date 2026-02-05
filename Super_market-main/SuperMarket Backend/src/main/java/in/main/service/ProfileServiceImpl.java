package in.main.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.main.dto.ProfileRequest;
import in.main.dto.ProfileResponse;
import in.main.entities.Product;
import in.main.entities.Profile;
import in.main.entities.User;
import in.main.repository.ProductRepository;
import in.main.repository.ProfileRepository;
import in.main.repository.UserRepository;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private ProductRepository productRepository;

    // ================= GET PROFILE =================
    @Override
    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser_Email(email)
                .orElseGet(() -> {
                    // Return empty profile if not found
                    Profile p = new Profile();
                    p.setUser(user);
                    p.setEmail(email);
                    p.setShopName(user.getShopName());
                    p.setShopAddress(user.getShopAddress());
                    // Initialize lists to avoid null pointer exceptions
                    p.setAcceptedPaymentMethods(new ArrayList<>());
                    p.setProductCategories(new ArrayList<>());
                    return p;
                });

        return mapToResponse(profile, user);
    }



    // ================= UPDATE PROFILE =================
    @Override
    public ProfileResponse updateProfile(
            User user,
            ProfileRequest request,
            MultipartFile profilePhoto,
            MultipartFile qrCode
    ) {

        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(managedUser)
                .orElseGet(() -> {
                    Profile p = new Profile();
                    p.setUser(managedUser);
                    return p;
                });

        // ===== BASIC DETAILS =====
        profile.setShopName(request.getShop_name());
        profile.setShopType(request.getShop_type());
        profile.setTagline(request.getTagline());
        profile.setEstablishedYear(request.getEstablished_year());

        profile.setShopAddress(request.getShop_address());
        profile.setPhoneNumber(request.getPhone_number());
        profile.setEmail(request.getEmail());
        profile.setWebsite(request.getWebsite());

        profile.setOpeningTime(request.getOpening_time());
        profile.setClosingTime(request.getClosing_time());
        profile.setWorkingDays(request.getWorking_days());

        // ===== BOOLEAN FLAGS =====
        profile.setDeliveryAvailable(request.isDeliveryAvailable());
        profile.setHomeDelivery(request.isHomeDelivery());
        profile.setParkingAvailable(request.isParkingAvailable());
        profile.setAcceptsOnlineOrders(request.isAcceptsOnlineOrders());

        // ===== BANK DETAILS =====
        profile.setBankAccountName(request.getBank_account_name());
        profile.setBankAccountNumber(request.getBank_account_number());
        profile.setBankName(request.getBank_name());
        profile.setIfscCode(request.getIfsc_code());
        profile.setUpiId(request.getUpi_id());

        // ===== TAX DETAILS =====
        profile.setGstNumber(request.getGst_number());
        profile.setTinNumber(request.getTin_number());
        profile.setPanNumber(request.getPan_number());
        profile.setCinNumber(request.getCin_number());

        profile.setDiscountOffers(request.getDiscount_offers());

        // ===== LIST FIELDS =====
        // Parse accepted_payment_methods
        if (request.getAccepted_payment_methods() != null && !request.getAccepted_payment_methods().isEmpty()) {
            profile.setAcceptedPaymentMethods(request.getAccepted_payment_methods());
        } else {
            profile.setAcceptedPaymentMethods(new ArrayList<>());
        }

        // Parse product_categories  
        if (request.getProduct_categories() != null && !request.getProduct_categories().isEmpty()) {
            profile.setProductCategories(request.getProduct_categories());
        } else {
            profile.setProductCategories(new ArrayList<>());
        }

        // ===== SOCIAL =====
        profile.setFacebook(request.getFacebook());
        profile.setInstagram(request.getInstagram());
        profile.setGoogleBusinessRating(request.getGoogle_business_rating());

        // ===== STORE INFO =====
        profile.setStoreArea(request.getStore_area());
        profile.setEmployeesCount(request.getEmployees_count());
        
        // ===== TAX CONFIGURATION =====
        if (request.getTax_rate() != null) {
            profile.setTaxRate(request.getTax_rate());
        }
        if (request.getGst_enabled() != null) {
            profile.setGstEnabled(request.getGst_enabled());
        }
        
        // ===== PAYMENT GATEWAY CONFIGURATION =====
        // Paytm
        profile.setPaytmMerchantId(request.getPaytm_merchant_id());
        profile.setPaytmMerchantKey(request.getPaytm_merchant_key());
        profile.setPaytmWebhookUrl(request.getPaytm_webhook_url());
        if (request.getPaytm_enabled() != null) {
            profile.setPaytmEnabled(request.getPaytm_enabled());
        }
        
        // PhonePe
        profile.setPhonepeMerchantId(request.getPhonepe_merchant_id());
        profile.setPhonepeSaltKey(request.getPhonepe_salt_key());
        profile.setPhonepeSaltIndex(request.getPhonepe_salt_index());
        if (request.getPhonepe_enabled() != null) {
            profile.setPhonepeEnabled(request.getPhonepe_enabled());
        }
        
        // Razorpay
        profile.setRazorpayKeyId(request.getRazorpay_key_id());
        profile.setRazorpayKeySecret(request.getRazorpay_key_secret());
        profile.setRazorpayWebhookSecret(request.getRazorpay_webhook_secret());
        if (request.getRazorpay_enabled() != null) {
            profile.setRazorpayEnabled(request.getRazorpay_enabled());
        }
        
        // PayU Money
        profile.setPayuMerchantKey(request.getPayu_merchant_key());
        profile.setPayuSalt(request.getPayu_salt());
        if (request.getPayu_enabled() != null) {
            profile.setPayuEnabled(request.getPayu_enabled());
        }

        // ===== AI CONFIGURATION =====
        if (request.getAi_mode() != null) {
            profile.setAiMode(request.getAi_mode());
        }
        if (request.getAi_enabled() != null) {
            profile.setAiEnabled(request.getAi_enabled());
        }
        if (request.getVoice_ai_enabled() != null) {
            profile.setVoiceAiEnabled(request.getVoice_ai_enabled());
        }
        if (request.getAuto_inventory_management() != null) {
            profile.setAutoInventoryManagement(request.getAuto_inventory_management());
        }
        if (request.getAuto_order_processing() != null) {
            profile.setAutoOrderProcessing(request.getAuto_order_processing());
        }
        if (request.getAi_load_balancing() != null) {
            profile.setAiLoadBalancing(request.getAi_load_balancing());
        }

        // ===== BILLING CONFIGURATION =====
        if (request.getBilling_mode() != null) {
            profile.setBillingMode(request.getBilling_mode());
        }
        if (request.getAuto_billing_confirm() != null) {
            profile.setAutoBillingConfirm(request.getAuto_billing_confirm());
        }
        if (request.getPaper_size() != null) {
            profile.setPaperSize(request.getPaper_size());
        }

        // ===== FILE UPLOADS =====
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            profile.setProfilePhoto(fileStorageService.save(profilePhoto));
        }

        if (qrCode != null && !qrCode.isEmpty()) {
            profile.setQrCode(fileStorageService.save(qrCode));
        }

        Profile savedProfile = profileRepository.save(profile);
        return mapToResponse(savedProfile, user);
    }

    // ================= RESPONSE MAPPER =================
    private ProfileResponse mapToResponse(Profile profile, User user) {

        ProfileResponse res = new ProfileResponse();

        res.setShop_name(profile.getShopName());
        res.setShop_type(profile.getShopType());
        res.setTagline(profile.getTagline());
        res.setEstablished_year(profile.getEstablishedYear());

        res.setShop_address(profile.getShopAddress());
        res.setPhone_number(profile.getPhoneNumber());
        res.setEmail(profile.getEmail());
        res.setWebsite(profile.getWebsite());

        res.setOpening_time(profile.getOpeningTime());
        res.setClosing_time(profile.getClosingTime());
        res.setWorking_days(profile.getWorkingDays());

        res.setDelivery_available(profile.isDeliveryAvailable());
        res.setHome_delivery(profile.isHomeDelivery());
        res.setParking_available(profile.isParkingAvailable());
        res.setAccepts_online_orders(profile.isAcceptsOnlineOrders());

        res.setBank_account_name(profile.getBankAccountName());
        res.setBank_account_number(profile.getBankAccountNumber());
        res.setBank_name(profile.getBankName());
        res.setIfsc_code(profile.getIfscCode());
        res.setUpi_id(profile.getUpiId());

        res.setGst_number(profile.getGstNumber());
        res.setTin_number(profile.getTinNumber());
        res.setPan_number(profile.getPanNumber());
        res.setCin_number(profile.getCinNumber());

        res.setDiscount_offers(profile.getDiscountOffers());
        res.setAccepted_payment_methods(profile.getAcceptedPaymentMethods());
        res.setProduct_categories(profile.getProductCategories());

        res.setFacebook(profile.getFacebook());
        res.setInstagram(profile.getInstagram());
        res.setGoogle_business_rating(profile.getGoogleBusinessRating());

        res.setStore_area(profile.getStoreArea());
        res.setEmployees_count(profile.getEmployeesCount());
        
        // Tax Configuration
        res.setTax_rate(profile.getTaxRate());
        res.setGst_enabled(profile.getGstEnabled());
        
        // Payment Gateway Configuration - Paytm
        res.setPaytm_merchant_id(profile.getPaytmMerchantId());
        res.setPaytm_merchant_key(profile.getPaytmMerchantKey());
        res.setPaytm_webhook_url(profile.getPaytmWebhookUrl());
        res.setPaytm_enabled(profile.getPaytmEnabled());
        
        // Payment Gateway Configuration - PhonePe
        res.setPhonepe_merchant_id(profile.getPhonepeMerchantId());
        res.setPhonepe_salt_key(profile.getPhonepeSaltKey());
        res.setPhonepe_salt_index(profile.getPhonepeSaltIndex());
        res.setPhonepe_enabled(profile.getPhonepeEnabled());
        
        // Payment Gateway Configuration - Razorpay
        res.setRazorpay_key_id(profile.getRazorpayKeyId());
        res.setRazorpay_key_secret(profile.getRazorpayKeySecret());
        res.setRazorpay_webhook_secret(profile.getRazorpayWebhookSecret());
        res.setRazorpay_enabled(profile.getRazorpayEnabled());
        
        // Payment Gateway Configuration - PayU Money
        res.setPayu_merchant_key(profile.getPayuMerchantKey());
        res.setPayu_salt(profile.getPayuSalt());
        res.setPayu_enabled(profile.getPayuEnabled());
        
        // AI Configuration
        res.setAi_mode(profile.getAiMode());
        res.setAi_enabled(profile.getAiEnabled());
        res.setVoice_ai_enabled(profile.getVoiceAiEnabled());
        res.setAuto_inventory_management(profile.getAutoInventoryManagement());
        res.setAuto_order_processing(profile.getAutoOrderProcessing());
        res.setAi_load_balancing(profile.getAiLoadBalancing());
        
        // Billing Configuration
        res.setBilling_mode(profile.getBillingMode());
        res.setAuto_billing_confirm(profile.getAutoBillingConfirm());
        res.setPaper_size(profile.getPaperSize());
        
        // Set professional number from user
        if (user != null) {
            res.setProfessional_number(user.getProfessionalNumber());
        }

        if (profile.getProfilePhoto() != null) {
            res.setProfile_photo(
                "http://localhost:8080/uploads/" + profile.getProfilePhoto()
            );
        }

        if (profile.getQrCode() != null) {
            res.setQr_code(
                "http://localhost:8080/uploads/" + profile.getQrCode()
            );
        }

        return res;
    }
    @Override
    public List<Product> getPublishedProductsByUserId(Long userId) {
        return productRepository.findByUserIdAndPublishedTrue(userId);
    }

}
