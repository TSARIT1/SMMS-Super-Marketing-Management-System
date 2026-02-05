package in.main.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import in.main.entities.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
