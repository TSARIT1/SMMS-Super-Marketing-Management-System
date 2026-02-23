package in.main.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.main.entities.Lead;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatusOrderByScoreDesc(String status);
    List<Lead> findByStatus(String status);
    List<Lead> findByIndustry(String industry);
    List<Lead> findByScoreGreaterThan(Integer score);
    List<Lead> findByStatusIn(List<String> statuses);
    List<Lead> findByStatusInOrderByEstimatedValueDesc(List<String> statuses);
    List<Lead> findByStatusInAndLastContactedAtBefore(List<String> statuses, LocalDateTime lastContactedAt);
    List<Lead> findByScoreGreaterThanEqual(Integer score);
}
