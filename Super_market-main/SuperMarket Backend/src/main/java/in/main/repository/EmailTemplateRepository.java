package in.main.repository;

import in.main.entities.EmailTemplate;
import in.main.entities.EmailTemplate.EmailType;
import in.main.entities.EmailTemplate.TemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    List<EmailTemplate> findByEmailType(EmailType emailType);

    List<EmailTemplate> findByStatus(TemplateStatus status);

    List<EmailTemplate> findByEmailTypeAndStatus(EmailType emailType, TemplateStatus status);

    Optional<EmailTemplate> findByTemplateName(String templateName);

    List<EmailTemplate> findByIsAiGenerated(Boolean isAiGenerated);

    List<EmailTemplate> findByCategory(String category);

    List<EmailTemplate> findByLanguage(String language);

    @Query("SELECT t FROM EmailTemplate t WHERE t.emailType = :emailType AND t.status = 'ACTIVE' ORDER BY t.updatedAt DESC")
    List<EmailTemplate> findActiveTemplatesByType(@Param("emailType") EmailType emailType);

    @Query("SELECT DISTINCT t.category FROM EmailTemplate t WHERE t.category IS NOT NULL")
    List<String> findAllCategories();

    @Query("SELECT t FROM EmailTemplate t WHERE LOWER(t.templateName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<EmailTemplate> searchTemplates(@Param("searchTerm") String searchTerm);

    boolean existsByTemplateName(String templateName);
}
