package in.main.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import in.main.dto.ProfileRequest;
import in.main.dto.ProfileResponse;
import in.main.entities.Product;
import in.main.entities.Profile;
import in.main.entities.User;
import in.main.repository.ProductRepository;
import in.main.repository.ProfileRepository;
import in.main.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;

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
    
    @Autowired
    private HttpServletRequest request;
    
    @Value("${app.base.url:}")
    private String appBaseUrl;

    // ================= GET PROFILE =================
    @Override
    @Transactional
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
    @Transactional
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
        if (request.getShop_name() != null) {
            profile.setShopName(request.getShop_name());
        }
        if (request.getShop_type() != null) {
            profile.setShopType(request.getShop_type());
        }
        if (request.getTagline() != null) {
            profile.setTagline(request.getTagline());
        }
        if (request.getEstablished_year() != null) {
            profile.setEstablishedYear(request.getEstablished_year());
        }

        if (request.getShop_address() != null) {
            profile.setShopAddress(request.getShop_address());
        }
        if (request.getPhone_number() != null) {
            profile.setPhoneNumber(request.getPhone_number());
        }
        if (request.getEmail() != null) {
            profile.setEmail(request.getEmail());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }

        if (request.getOpening_time() != null) {
            profile.setOpeningTime(request.getOpening_time());
        }
        if (request.getClosing_time() != null) {
            profile.setClosingTime(request.getClosing_time());
        }
        if (request.getWorking_days() != null) {
            profile.setWorkingDays(request.getWorking_days());
        }

        // ===== BOOLEAN FLAGS =====
        if (request.getDeliveryAvailable() != null) {
            profile.setDeliveryAvailable(request.getDeliveryAvailable());
        }
        if (request.getHomeDelivery() != null) {
            profile.setHomeDelivery(request.getHomeDelivery());
        }
        if (request.getParkingAvailable() != null) {
            profile.setParkingAvailable(request.getParkingAvailable());
        }
        if (request.getAcceptsOnlineOrders() != null) {
            profile.setAcceptsOnlineOrders(request.getAcceptsOnlineOrders());
        }

        // ===== BANK DETAILS =====
        if (request.getBank_account_name() != null) {
            profile.setBankAccountName(request.getBank_account_name());
        }
        if (request.getBank_account_number() != null) {
            profile.setBankAccountNumber(request.getBank_account_number());
        }
        if (request.getBank_name() != null) {
            profile.setBankName(request.getBank_name());
        }
        if (request.getIfsc_code() != null) {
            profile.setIfscCode(request.getIfsc_code());
        }
        if (request.getUpi_id() != null) {
            profile.setUpiId(request.getUpi_id());
        }

        // ===== TAX DETAILS =====
        if (request.getGst_number() != null) {
            profile.setGstNumber(request.getGst_number());
        }
        if (request.getTin_number() != null) {
            profile.setTinNumber(request.getTin_number());
        }
        if (request.getPan_number() != null) {
            profile.setPanNumber(request.getPan_number());
        }
        if (request.getCin_number() != null) {
            profile.setCinNumber(request.getCin_number());
        }

        if (request.getDiscount_offers() != null) {
            profile.setDiscountOffers(request.getDiscount_offers());
        }
        
        // ===== LOYALTY AND DISCOUNT CONFIGURATION =====
        if (request.getLoyalty_points_enabled() != null) {
            profile.setLoyaltyPointsEnabled(request.getLoyalty_points_enabled());
        }
        if (request.getLoyalty_points_rate() != null) {
            profile.setLoyaltyPointsRate(request.getLoyalty_points_rate());
        }
        if (request.getReferral_discount() != null) {
            profile.setReferralDiscount(request.getReferral_discount());
        }

        // ===== LIST FIELDS =====
        if (request.getAccepted_payment_methods() != null) {
            profile.setAcceptedPaymentMethods(request.getAccepted_payment_methods());
        }
        if (request.getProduct_categories() != null) {
            profile.setProductCategories(request.getProduct_categories());
        }

        // ===== SOCIAL =====
        if (request.getFacebook() != null) {
            profile.setFacebook(request.getFacebook());
        }
        if (request.getInstagram() != null) {
            profile.setInstagram(request.getInstagram());
        }
        if (request.getGoogle_business_rating() != null) {
            profile.setGoogleBusinessRating(request.getGoogle_business_rating());
        }

        // ===== STORE INFO =====
        if (request.getStore_area() != null) {
            profile.setStoreArea(request.getStore_area());
        }
        if (request.getEmployees_count() != null) {
            profile.setEmployeesCount(request.getEmployees_count());
        }
        
        // ===== TAX CONFIGURATION =====
        if (request.getTax_rate() != null) {
            profile.setTaxRate(request.getTax_rate());
        }
        if (request.getGst_enabled() != null) {
            profile.setGstEnabled(request.getGst_enabled());
        }
        
        // ===== PAYMENT GATEWAY CONFIGURATION =====
        // Paytm
        if (request.getPaytm_merchant_id() != null) {
            profile.setPaytmMerchantId(request.getPaytm_merchant_id());
        }
        if (request.getPaytm_merchant_key() != null) {
            profile.setPaytmMerchantKey(request.getPaytm_merchant_key());
        }
        if (request.getPaytm_webhook_url() != null) {
            profile.setPaytmWebhookUrl(request.getPaytm_webhook_url());
        }
        if (request.getPaytm_enabled() != null) {
            profile.setPaytmEnabled(request.getPaytm_enabled());
        }
        
        // PhonePe
        if (request.getPhonepe_merchant_id() != null) {
            profile.setPhonepeMerchantId(request.getPhonepe_merchant_id());
        }
        if (request.getPhonepe_salt_key() != null) {
            profile.setPhonepeSaltKey(request.getPhonepe_salt_key());
        }
        if (request.getPhonepe_salt_index() != null) {
            profile.setPhonepeSaltIndex(request.getPhonepe_salt_index());
        }
        if (request.getPhonepe_enabled() != null) {
            profile.setPhonepeEnabled(request.getPhonepe_enabled());
        }
        
        // Razorpay
        if (request.getRazorpay_key_id() != null) {
            profile.setRazorpayKeyId(request.getRazorpay_key_id());
        }
        if (request.getRazorpay_key_secret() != null) {
            profile.setRazorpayKeySecret(request.getRazorpay_key_secret());
        }
        if (request.getRazorpay_webhook_secret() != null) {
            profile.setRazorpayWebhookSecret(request.getRazorpay_webhook_secret());
        }
        if (request.getRazorpay_enabled() != null) {
            profile.setRazorpayEnabled(request.getRazorpay_enabled());
        }
        
        // PayU Money
        if (request.getPayu_merchant_key() != null) {
            profile.setPayuMerchantKey(request.getPayu_merchant_key());
        }
        if (request.getPayu_salt() != null) {
            profile.setPayuSalt(request.getPayu_salt());
        }
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
        if (request.getBill_background_image() != null) {
            profile.setBillBackgroundImage(request.getBill_background_image());
        }

        // ===== FILE UPLOADS =====
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            System.out.println("📸 Saving profile photo: " + profilePhoto.getOriginalFilename());
            String savedFileName = fileStorageService.save(profilePhoto);
            System.out.println("📸 Profile photo saved as: " + savedFileName);
            profile.setProfilePhoto(savedFileName);
        } else {
            System.out.println("📸 No profile photo to save (file is null or empty)");
        }

        if (qrCode != null && !qrCode.isEmpty()) {
            System.out.println("📸 Saving QR code: " + qrCode.getOriginalFilename());
            String savedFileName = fileStorageService.save(qrCode);
            System.out.println("📸 QR code saved as: " + savedFileName);
            profile.setQrCode(savedFileName);
        }

        Profile savedProfile = profileRepository.save(profile);
        System.out.println("✅ Profile saved successfully with ID: " + savedProfile.getId());
        System.out.println("📸 Profile photo in DB: " + savedProfile.getProfilePhoto());
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
        
        // Loyalty and Discount Configuration
        res.setLoyalty_points_enabled(profile.getLoyaltyPointsEnabled());
        res.setLoyalty_points_rate(profile.getLoyaltyPointsRate());
        res.setReferral_discount(profile.getReferralDiscount());
        
        res.setAccepted_payment_methods(
                profile.getAcceptedPaymentMethods() == null
                        ? new ArrayList<>()
                        : new ArrayList<>(profile.getAcceptedPaymentMethods())
        );
        res.setProduct_categories(
                profile.getProductCategories() == null
                        ? new ArrayList<>()
                        : new ArrayList<>(profile.getProductCategories())
        );

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
        res.setBill_background_image(profile.getBillBackgroundImage());
        
        // Set professional number from user
        if (user != null) {
            res.setProfessional_number(user.getProfessionalNumber());
        }
        
        // Set referral code (generate if not exists)
        String referralCode = profile.getReferralCode();
        if (referralCode == null || referralCode.isBlank()) {
            // Generate a referral code based on shop name or user ID
            String shopName = profile.getShopName() != null ? profile.getShopName() : "STORE";
            referralCode = shopName.toUpperCase().replaceAll("[^A-Z0-9]", "").substring(0, Math.min(shopName.length(), 6)) + String.format("%04d", user != null ? user.getId() : System.currentTimeMillis() % 10000);
            profile.setReferralCode(referralCode);
            profileRepository.save(profile);
            System.out.println("📸 Generated new referral code: " + referralCode);
        }
        res.setReferral_code(referralCode);
        res.setReference_code(referralCode); // Same as referral_code for compatibility

        // Build dynamic base URL for file uploads
        String baseUrl = getBaseUrl();
        
        if (profile.getProfilePhoto() != null) {
            res.setProfile_photo(baseUrl + "/uploads/" + profile.getProfilePhoto());
        }

        if (profile.getQrCode() != null) {
            res.setQr_code(baseUrl + "/uploads/" + profile.getQrCode());
        }

        return res;
    }
    
    /**
     * Get the base URL for serving uploaded files.
     * Uses configured app.base.url if available, otherwise derives from the current request.
     */
    private String getBaseUrl() {
        // First check if a base URL is configured
        if (appBaseUrl != null && !appBaseUrl.isBlank()) {
            return appBaseUrl;
        }
        
        // Otherwise, derive from the current request
        try {
            if (request != null) {
                String scheme = request.getScheme();
                String serverName = request.getServerName();
                int serverPort = request.getServerPort();
                
                // Build URL with proper port handling
                StringBuilder url = new StringBuilder();
                url.append(scheme).append("://").append(serverName);
                
                // Only append port if it's not the default port for the scheme
                if (("http".equals(scheme) && serverPort != 80) || 
                    ("https".equals(scheme) && serverPort != 443)) {
                    url.append(":").append(serverPort);
                }
                
                return url.toString();
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not determine base URL from request: " + e.getMessage());
        }
        
        // Fallback to localhost
        return "http://localhost:8080";
    }
    @Override
    public List<Product> getPublishedProductsByUserId(Long userId) {
        return productRepository.findByUserIdAndPublishedTrue(userId);
    }

}
