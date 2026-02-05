package in.main.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.main.dto.ProfileRequest;
import in.main.dto.ProfileResponse;
import in.main.entities.Product;
import in.main.entities.User;

public interface ProfileService {

    // Get logged-in user's profile
   // ProfileResponse getProfile(User user);

    // Create or update profile with files
    ProfileResponse updateProfile(
            User user,
            ProfileRequest request,
            MultipartFile profilePhoto,
            MultipartFile qrCode
    );

	ProfileResponse getProfile(String email);

	List<Product> getPublishedProductsByUserId(Long userId);
	
}

