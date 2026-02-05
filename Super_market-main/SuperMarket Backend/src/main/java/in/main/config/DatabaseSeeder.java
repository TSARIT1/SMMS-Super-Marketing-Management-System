package in.main.config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import in.main.entities.User;
import in.main.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedDemoUser();
        // seedSuperAdminUser(); // Optional: if different from admin
    }

    private void seedAdminUser() {
        String adminEmail = "info@tsaritservices.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setFullName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPhone("+919491301258");
            admin.setShopName("TSAR IT SMMS Admin");
            admin.setShopAddress("Chennai, India");
            admin.setRole(User.Role.SUPER_ADMIN); // Or ADMIN depending on requirement. create_super_admin.sql used SUPER_ADMIN
            admin.setAccountStatus(User.AccountStatus.ACTIVE);
            
            // Password: admin123
            // Storing as BCrypt hash automatically
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            
            userRepository.save(admin);
            System.out.println("LOG: Admin user created successfully: " + adminEmail);
        } else {
            System.out.println("LOG: Admin user already exists: " + adminEmail);
        }
    }

    private void seedDemoUser() {
        String demoEmail = "demo@tsaritservices.com";
        Optional<User> existingDemo = userRepository.findByEmail(demoEmail);

        if (existingDemo.isEmpty()) {
            User demo = new User();
            demo.setFullName("Demo User");
            demo.setEmail(demoEmail);
            demo.setPhone("+910000000000");
            demo.setShopName("Demo SuperMarket");
            demo.setShopAddress("Demo City");
            demo.setRole(User.Role.USER);
            demo.setAccountStatus(User.AccountStatus.ACTIVE);
            demo.setPasswordHash(passwordEncoder.encode("demo123"));
            userRepository.save(demo);
            System.out.println("LOG: Demo user created successfully: " + demoEmail);
        } else {
            System.out.println("LOG: Demo user already exists: " + demoEmail);
        }
    }
}

