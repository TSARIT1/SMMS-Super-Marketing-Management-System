package in.main.repository;

import in.main.entities.SubscriptionPlan;
import in.main.entities.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByIsActiveTrue();
    Optional<SubscriptionPlan> findByPlanType(PlanType planType);
    Optional<SubscriptionPlan> findByPlanName(String planName);
}
