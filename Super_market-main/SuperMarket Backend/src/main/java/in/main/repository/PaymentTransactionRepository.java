package in.main.repository;

import in.main.entities.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByUser_Id(Long userId);
    Optional<PaymentTransaction> findByRazorpayPaymentId(String razorpayPaymentId);
    Optional<PaymentTransaction> findByRazorpayOrderId(String razorpayOrderId);

    // Added for billing queries
    java.util.List<PaymentTransaction> findByCreatedAtAfter(java.time.LocalDateTime time);
    java.util.List<PaymentTransaction> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
