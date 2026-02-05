package in.main.repository;

import in.main.entities.EmailLog;
import in.main.entities.EmailLog.EmailStatus;
import in.main.entities.EmailLog.EmailPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findByRecipientEmail(String recipientEmail);

    List<EmailLog> findByStatus(EmailStatus status);

    List<EmailLog> findByEmailType(String emailType);

    List<EmailLog> findBySentBy(Long sentBy);

    List<EmailLog> findByUserId(Long userId);

    List<EmailLog> findByTicketId(Long ticketId);

    List<EmailLog> findBySubscriptionId(Long subscriptionId);

    List<EmailLog> findByOrderId(Long orderId);

    List<EmailLog> findByIsAiGenerated(Boolean isAiGenerated);

    List<EmailLog> findByCampaignName(String campaignName);

    Page<EmailLog> findByStatus(EmailStatus status, Pageable pageable);

    Page<EmailLog> findByEmailType(String emailType, Pageable pageable);

    Page<EmailLog> findBySentBy(Long sentBy, Pageable pageable);

    @Query("SELECT e FROM EmailLog e WHERE e.createdAt BETWEEN :startDate AND :endDate")
    List<EmailLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM EmailLog e WHERE e.createdAt BETWEEN :startDate AND :endDate")
    Page<EmailLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = :status AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countByStatusAndDateRange(@Param("status") EmailStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.emailType = :emailType AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countByEmailTypeAndDateRange(@Param("emailType") String emailType, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM EmailLog e WHERE LOWER(e.recipientEmail) LIKE LOWER(CONCAT('%', :email, '%')) OR LOWER(e.recipientName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(e.subject) LIKE LOWER(CONCAT('%', :subject, '%'))")
    List<EmailLog> searchEmails(@Param("email") String email, @Param("name") String name, @Param("subject") String subject);

    @Query("SELECT e FROM EmailLog e WHERE e.isOpened = true AND e.openedAt BETWEEN :startDate AND :endDate")
    List<EmailLog> findOpenedEmailsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM EmailLog e WHERE e.isClicked = true AND e.clickedAt BETWEEN :startDate AND :endDate")
    List<EmailLog> findClickedEmailsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(e.clickCount) FROM EmailLog e WHERE e.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageClickCount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = 'FAILED' AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countFailedEmails(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = 'BOUNCED' AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countBouncedEmails(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT e.emailType FROM EmailLog e")
    List<String> findAllEmailTypes();

    @Query("SELECT e FROM EmailLog e WHERE e.retryCount > 0 AND e.status = 'FAILED' AND e.nextRetryAt < :currentTime")
    List<EmailLog> findEmailsForRetry(@Param("currentTime") LocalDateTime currentTime);
}
