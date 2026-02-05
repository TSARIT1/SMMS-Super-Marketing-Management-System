package in.main.repository;

import in.main.entities.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    @Query("SELECT m.ticket.id, COUNT(m) FROM TicketMessage m WHERE m.ticket.id IN :ids GROUP BY m.ticket.id")
    List<Object[]> countMessagesByTicketIds(@Param("ids") List<Long> ids);

    @Query("SELECT m FROM TicketMessage m WHERE m.ticket.id IN :ids AND m.createdAt IN (SELECT MAX(m2.createdAt) FROM TicketMessage m2 WHERE m2.ticket.id = m.ticket.id)")
    List<TicketMessage> findLastMessagesForTicketIds(@Param("ids") List<Long> ids);
}