package in.main.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Cache Configuration for High Scale Performance
 * Optimized for 10M users with 60ms response time
 */
@Configuration
@EnableCaching
public class CacheConfig {

    // Cache names with their TTL configurations
    public static final String USER_CACHE = "users";
    public static final String PRODUCT_CACHE = "products";
    public static final String CATEGORY_CACHE = "categories";
    public static final String INVENTORY_CACHE = "inventory";
    public static final String ORDER_CACHE = "orders";
    public static final String PROFILE_CACHE = "profiles";
    public static final String SUBSCRIPTION_CACHE = "subscriptions";
    public static final String DASHBOARD_CACHE = "dashboard";
    public static final String ANALYTICS_CACHE = "analytics";
    public static final String SETTINGS_CACHE = "settings";
    public static final String BILLING_CACHE = "billing"; // Ultra-fast billing cache

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        // Default cache configuration - 5 minutes TTL
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues()
                .prefixCacheNameWith("smms:");

        // Specific cache configurations with different TTLs
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // User cache - 30 minutes (users don't change frequently)
        cacheConfigurations.put(USER_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Product cache - 2 minutes (inventory changes frequently)
        cacheConfigurations.put(PRODUCT_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(2)));

        // Category cache - 1 hour (rarely changes)
        cacheConfigurations.put(CATEGORY_CACHE, defaultConfig.entryTtl(Duration.ofHours(1)));

        // Inventory cache - 1 minute (real-time updates needed)
        cacheConfigurations.put(INVENTORY_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(1)));

        // Order cache - 5 minutes
        cacheConfigurations.put(ORDER_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Profile cache - 15 minutes
        cacheConfigurations.put(PROFILE_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Subscription cache - 10 minutes
        cacheConfigurations.put(SUBSCRIPTION_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // Dashboard cache - 30 seconds (near real-time)
        cacheConfigurations.put(DASHBOARD_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(30)));

        // Analytics cache - 5 minutes
        cacheConfigurations.put(ANALYTICS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Settings cache - 1 hour
        cacheConfigurations.put(SETTINGS_CACHE, defaultConfig.entryTtl(Duration.ofHours(1)));

        // Billing cache - 30 seconds (ultra-fast for billing operations)
        cacheConfigurations.put(BILLING_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(30)));

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }

    /**
     * Custom key generator for complex cache keys
     */
    @Bean
    public KeyGenerator customKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getSimpleName()).append(":");
            sb.append(method.getName()).append(":");
            for (Object param : params) {
                sb.append(param != null ? param.toString() : "null").append(":");
            }
            return sb.toString().replaceAll(":$", "");
        };
    }
}