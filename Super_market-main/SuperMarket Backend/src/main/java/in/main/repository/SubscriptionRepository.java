package in.main.repository;

import in.main.entities.Subscription;
import in.main.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUser(User user);
    Optional<Subscription> findByUser_Id(Long userId);
    Optional<Subscription> findByRazorpaySubscriptionId(String razorpaySubscriptionId);

    // Billing related queries
    java.util.List<Subscription> findByStatusAndNextBillingDateBefore(in.main.entities.Subscription.SubscriptionStatus status, java.time.LocalDateTime time);
    java.util.List<Subscription> findByCreatedAtAfter(java.time.LocalDateTime time);
}
