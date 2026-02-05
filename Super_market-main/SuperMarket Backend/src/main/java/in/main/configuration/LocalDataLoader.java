package in.main.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import in.main.entities.PlanType;
import in.main.entities.SubscriptionPlan;
import in.main.entities.User;
import in.main.repository.SubscriptionPlanRepository;
import in.main.repository.UserRepository;

@Configuration
public class LocalDataLoader {

    @Bean
    CommandLineRunner initLocalData(UserRepository userRepository, PasswordEncoder passwordEncoder, SubscriptionPlanRepository subscriptionPlanRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@supermart.com").isEmpty()) {
                User admin = new User();
                admin.setFullName("Local Super Admin");
                admin.setEmail("admin@supermart.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(User.Role.SUPER_ADMIN);
                admin.setAccountStatus(User.AccountStatus.ACTIVE);
                userRepository.save(admin);
                System.out.println("[LocalDataLoader] Created default super admin: admin@supermart.com / admin123");
            }

            if (userRepository.findByEmail("superadmin@supermart.com").isEmpty()) {
                User superAdmin = new User();
                superAdmin.setFullName("Super Administrator");
                superAdmin.setEmail("superadmin@supermart.com");
                superAdmin.setPhone("9999999999");
                superAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
                superAdmin.setRole(User.Role.SUPER_ADMIN);
                superAdmin.setAccountStatus(User.AccountStatus.ACTIVE);
                userRepository.save(superAdmin);
                System.out.println("[LocalDataLoader] Created additional super admin: superadmin@supermart.com / admin123");
            }

            // Create default subscription plans if they don't exist
            if (subscriptionPlanRepository.count() == 0) {
                // SubscriptionPlan free = new SubscriptionPlan(); 
                // REMOVED DEMO PLAN AS PER REQUIREMENT

                SubscriptionPlan silver = new SubscriptionPlan();
                silver.setPlanName("Silver");
                silver.setPlanType(PlanType.STANDARD);
                silver.setPrice(6000.0);
                silver.setDurationDays(180);
                silver.setDescription("Silver plan for 6 months with unlimited features");
                silver.setMaxProducts(-1); // unlimited
                silver.setMaxUsers(-1); // unlimited
                silver.setIsActive(true);
                silver.setIsPopular(true);
                silver.setIconColor("#9CA3AF");
                subscriptionPlanRepository.save(silver);

                SubscriptionPlan platinum = new SubscriptionPlan();
                platinum.setPlanName("Platinum");
                platinum.setPlanType(PlanType.PREMIUM);
                platinum.setPrice(12000.0);
                platinum.setDurationDays(365);
                platinum.setDescription("Platinum plan for 1 year with unlimited features");
                platinum.setMaxProducts(-1); // unlimited
                platinum.setMaxUsers(-1); // unlimited
                platinum.setIsActive(true);
                platinum.setIsPopular(false);
                platinum.setIconColor("#F59E0B");
                subscriptionPlanRepository.save(platinum);

                SubscriptionPlan gold = new SubscriptionPlan();
                gold.setPlanName("Gold");
                gold.setPlanType(PlanType.ENTERPRISE);
                gold.setPrice(25000.0);
                gold.setDurationDays(730); // 2 years
                gold.setDescription("Gold plan for 2 years with unlimited features");
                gold.setMaxProducts(-1); // unlimited
                gold.setMaxUsers(-1); // unlimited
                gold.setIsActive(true);
                gold.setIsPopular(false);
                gold.setIconColor("#FCD34D");
                subscriptionPlanRepository.save(gold);

                System.out.println("[LocalDataLoader] Created default subscription plans");
            }
        };
    }
}
