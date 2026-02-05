package in.main.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

public class AuthRequests {
    public static class ForgotPassword {
    	private String email;

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}
    	
	}
	@NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
		@JsonProperty("full_name")
	    private String fullName;

	    @JsonProperty("shop_name")
	    private String shopName;

	    @JsonProperty("shop_address")
	    private String shopAddress;
	    
	    @JsonProperty("referred_by")
	    private String referredBy;
	    
        private String email;
        private String phone;
        private String password;
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
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
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
		
    }
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
    	private String emailOrPhone;
        private String password;
        public String getEmailOrPhone() {
			return emailOrPhone;
		}
		public void setEmailOrPhone(String emailOrPhone) {
			this.emailOrPhone = emailOrPhone;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
    }
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPassword {
        private String token;
        private String newPassword;
		public String getToken() {
			return token;
		}
		public void setToken(String token) {
			this.token = token;
		}
		public String getNewPassword() {
			return newPassword;
		}
		public void setNewPassword(String newPassword) {
			this.newPassword = newPassword;
		}
    }

}
