package in.main.service;

import java.util.Optional;

import in.main.dto.AuthRequests;
import in.main.entities.User;

public interface UserService {
	public User register(AuthRequests.RegisterRequest req);
	public Optional<User> login(AuthRequests.LoginRequest req);
	public Optional<User> getByEmail (AuthRequests.ForgotPassword req);
	void save(User user);
	Optional<User> findByResetTokenHash(String tokenHash);
	void initiatePasswordReset(String email);

	void resetPassword(AuthRequests.ResetPassword req);


}
