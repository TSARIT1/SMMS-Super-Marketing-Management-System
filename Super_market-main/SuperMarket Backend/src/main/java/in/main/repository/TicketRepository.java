package in.main.repository;

import in.main.entities.Ticket;
import in.main.entities.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByUserId(Long userId);
    
    List<Ticket> findByStatus(TicketStatus status);
    
    List<Ticket> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);
    
    org.springframework.data.domain.Page<Ticket> findAllByDeletedFalseOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    List<Ticket> findAllByDeletedFalseOrderByCreatedAtDesc();
    
    Long countByStatus(TicketStatus status);
    
    Long countByUserId(Long userId);
    
    Long countByStatusAndDeletedFalse(TicketStatus status);
}
