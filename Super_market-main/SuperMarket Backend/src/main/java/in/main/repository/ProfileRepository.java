package in.main.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import in.main.entities.Profile;
import in.main.entities.User;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUser(User user);

    Optional<Profile> findByUser_Email(String email);
}

