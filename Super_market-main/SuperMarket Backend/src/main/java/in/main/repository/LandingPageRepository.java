package in.main.repository;

import in.main.entities.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LandingPageRepository extends JpaRepository<LandingPage, Long> {
}
