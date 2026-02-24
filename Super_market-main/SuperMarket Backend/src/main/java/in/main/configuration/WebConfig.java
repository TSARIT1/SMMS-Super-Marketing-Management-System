package in.main.configuration;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path for uploads directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        File uploadFolder = uploadPath.toFile();
        
        // Create uploads directory if it doesn't exist
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            System.out.println("📁 Created uploads directory: " + uploadPath + " - Success: " + created);
        }
        
        String uploadLocation = uploadPath.toUri().toString();
        System.out.println("📁 Serving uploads from: " + uploadLocation);
        
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadLocation);
        
        // Also serve onboarding uploads directly
        Path onboardingPath = Paths.get("uploads/onboarding").toAbsolutePath().normalize();
        File onboardingFolder = onboardingPath.toFile();
        if (!onboardingFolder.exists()) {
            boolean created = onboardingFolder.mkdirs();
            System.out.println("📁 Created onboarding uploads directory: " + onboardingPath + " - Success: " + created);
        }
        
        registry
            .addResourceHandler("/onboarding-files/**")
            .addResourceLocations(onboardingPath.toUri().toString());
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS for API endpoints
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:8081", "http://localhost:8082", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:8081", "http://127.0.0.1:8082", "https://smms.tsaritservices.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        
        // CORS for onboarding endpoints (including file uploads)
        registry.addMapping("/onboarding/**")
                .allowedOriginPatterns("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:8081", "http://localhost:8082", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:8081", "http://127.0.0.1:8082", "https://smms.tsaritservices.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        
        // CORS for uploads (profile photos, QR codes, etc.)
        registry.addMapping("/uploads/**")
                .allowedOriginPatterns("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:8081", "http://localhost:8082", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:8081", "http://127.0.0.1:8082", "https://smms.tsaritservices.com")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:8081", "http://localhost:8082", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:8081", "http://127.0.0.1:8082", "https://smms.tsaritservices.com"));

        // Expose Access-Control-Allow-Origin for richer dev workflows (contains the requesting origin if allowed)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "userid", "*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/onboarding/**", configuration);
        return source;
    }
}

