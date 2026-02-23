package in.main.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private SubscriptionInterceptor subscriptionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(subscriptionInterceptor)
                .addPathPatterns(
                    "/api/admin/inventory",
                    "/api/admin/inventory/**",
                    "/api/notifications/**",
                    "/api/analytics/**",
                    "/api/products/**"
                )
                .excludePathPatterns(
                    "/api/orders",
                    "/api/orders/**",
                    "/api/subscription/**", 
                    "/api/subscription-plans/**", 
                    "/api/admin/**",
                    "/api/shop/products",
                    "/api/shop/products/**"
                );
    }
}
