package in.main.repository;

import in.main.entities.Onboarding;
import in.main.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {

    Optional<Onboarding> findByUser(User user);

    Optional<Onboarding> findByUserId(Long userId);

    boolean existsByUserAndIsCompleted(User user, boolean isCompleted);

    boolean existsByUserIdAndIsCompleted(Long userId, boolean isCompleted);
}
