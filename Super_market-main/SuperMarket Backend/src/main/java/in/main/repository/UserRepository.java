package in.main.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.main.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

	Optional<User> findByPhone(String Phone);
	Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrPhone(String email, String phone);
	Optional<User> findByResetTokenHash(String resetTokenHash);
	Optional<User> findByProfessionalNumber(String professionalNumber);

	// Search by name or email with paging
	org.springframework.data.domain.Page<in.main.entities.User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email, org.springframework.data.domain.Pageable pageable);

}
