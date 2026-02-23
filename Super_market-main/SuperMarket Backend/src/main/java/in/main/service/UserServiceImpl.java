package in.main.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import in.main.dto.AuthRequests;
import in.main.dto.AuthRequests.ForgotPassword;
import in.main.entities.User;
import in.main.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository repo;

    @Autowired 
    private EmailService emailService;
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public User register(AuthRequests.RegisterRequest req) {
        LOGGER.info("Registering new user with email: {}", req.getEmail());
        User u = new User();
        u.setFullName(req.getFullName());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setShopName(req.getShopName());
        u.setShopAddress(req.getShopAddress());
        u.setReferredBy(req.getReferredBy());
        
        // Hash the password before storing
        u.setPasswordHash(encoder.encode(req.getPassword()));
        // Set default role as USER
        u.setRole(User.Role.USER);
        
        // Generate unique professional number
        u.setProfessionalNumber(generateProfessionalNumber());
        
        // Save user to database
        User savedUser = repo.save(u);
        LOGGER.info("User registered successfully: {}", savedUser.getEmail());

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getShopName(),
                savedUser.getProfessionalNumber()
            );
            LOGGER.info("Welcome email sent to {}", savedUser.getEmail());
        } catch (Exception e) {
            // Log error but don't fail registration if email fails
            LOGGER.error("Failed to send welcome email to {}", savedUser.getEmail(), e);
        }

        return savedUser;
    }
    
    private String generateProfessionalNumber() {
        // Format: TITSMMS001, TITSMMS002, etc.
        long count = repo.count() + 1;
        return String.format("TITSMMS%03d", count);
    }


    @Override
    public Optional<User> login(AuthRequests.LoginRequest req) {
        LOGGER.info("Login attempt for: {}", req.getEmailOrPhone());
        Optional<User> maybe = repo.findByEmail(req.getEmailOrPhone());
        if (maybe.isEmpty()) {
            maybe = repo.findByPhone(req.getEmailOrPhone());
        }
        if (maybe.isPresent()) {
            User u = maybe.get();
            String storedPassword = u.getPasswordHash();
            if (storedPassword == null || storedPassword.isBlank()) {
                LOGGER.warn("Login failed: No password set for user {}", req.getEmailOrPhone());
                return Optional.empty();
            }

            // Standard BCrypt validation
            if (encoder.matches(req.getPassword(), storedPassword)) {
                LOGGER.info("Login successful for user: {}", req.getEmailOrPhone());
                return Optional.of(u);
            }

            // Legacy/dev fallback: allow plain-text password rows and migrate to BCrypt.
            if (req.getPassword() != null && req.getPassword().equals(storedPassword)) {
                u.setPasswordHash(encoder.encode(req.getPassword()));
                repo.save(u);
                LOGGER.info("Login successful (legacy password) for user: {}", req.getEmailOrPhone());
                return Optional.of(u);
            }
            LOGGER.warn("Login failed: Incorrect password for user {}", req.getEmailOrPhone());
        } else {
            LOGGER.warn("Login failed: User not found for {}", req.getEmailOrPhone());
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> getByEmail(ForgotPassword req) {
        return repo.findByEmail(req.getEmail());
    }

    @Override
    public void save(User user) {
        repo.save(user);
    }

    @Override
    public Optional<User> findByResetTokenHash(String tokenHash) {
        return repo.findByResetTokenHash(tokenHash);
    }

    @Override
    public void initiatePasswordReset(String email) {
        LOGGER.info("Initiating password reset for email: {}", email);
        Optional<User> foundUser = repo.findByEmail(email);

        if (foundUser.isEmpty()) {
            LOGGER.warn("Password reset requested for non-existent email: {}", email);
            return; // security: don't reveal existence
        }

        User user = foundUser.get();
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = DigestUtils.sha256Hex(rawToken);

        user.setResetTokenHash(tokenHash);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        repo.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        try {
            emailService.sendResetPasswordLink(user.getEmail(), resetLink);
            LOGGER.info("Password reset link sent to {}", user.getEmail());
        } catch (Exception e) {
            LOGGER.error("Failed to send password reset link to {}", user.getEmail(), e);
        }
    }

    @Override
    public void resetPassword(AuthRequests.ResetPassword req) {
        LOGGER.info("Resetting password for token: {}", req.getToken());
        String tokenHash = DigestUtils.sha256Hex(req.getToken());

        User user = repo.findByResetTokenHash(tokenHash)
                .orElseThrow(() -> {
                    LOGGER.warn("Invalid or expired reset link for token: {}", req.getToken());
                    return new RuntimeException("Invalid or expired reset link");
                });

        if (user.getResetTokenExpiry() == null ||
            user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Reset link expired for user: {}", user.getEmail());
            throw new RuntimeException("Reset link expired");
        }

        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        user.setResetTokenHash(null);
        user.setResetTokenExpiry(null);

        repo.save(user);
        LOGGER.info("Password reset successful for user: {}", user.getEmail());
    }
}
