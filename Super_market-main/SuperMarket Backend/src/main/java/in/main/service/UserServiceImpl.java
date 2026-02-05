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

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository repo;

    @Autowired 
    private EmailService emailService;
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public User register(AuthRequests.RegisterRequest req) {
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
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getShopName(),
                savedUser.getProfessionalNumber()
            );
        } catch (Exception e) {
            // Log error but don't fail registration if email fails
            logger.error("Failed to send welcome email to {}", savedUser.getEmail(), e);
        }
        
        return savedUser;
    }
    
    private String generateProfessionalNumber() {
        // Format: TITSMMS001, TITSMMS002, etc.
        long count = repo.count() + 1;
        return String.format("TITSMMS%03d", count);
    }


    public Optional<User> login(AuthRequests.LoginRequest req) {
        Optional<User> maybe = repo.findByEmail(req.getEmailOrPhone());
        if (maybe.isEmpty()) {
            maybe = repo.findByPhone(req.getEmailOrPhone());
        }
        if (maybe.isPresent()) {
            User u = maybe.get();
            if (encoder.matches(req.getPassword(), u.getPasswordHash())) {
                return Optional.of(u);
            }
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
        Optional<User> foundUser = repo.findByEmail(email);

        if (foundUser.isEmpty()) {
            return; // security: don't reveal existence
        }

        User user = foundUser.get();
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = DigestUtils.sha256Hex(rawToken);

        user.setResetTokenHash(tokenHash);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        repo.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        emailService.sendResetPasswordLink(user.getEmail(), resetLink);
    }

    @Override
    public void resetPassword(AuthRequests.ResetPassword req) {
        String tokenHash = DigestUtils.sha256Hex(req.getToken());

        User user = repo.findByResetTokenHash(tokenHash)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (user.getResetTokenExpiry() == null ||
            user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset link expired");
        }

        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        user.setResetTokenHash(null);
        user.setResetTokenExpiry(null);

        repo.save(user);
    }
}
