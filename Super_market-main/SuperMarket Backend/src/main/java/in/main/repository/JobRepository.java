package in.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.main.entities.Job;
import in.main.entities.Job.JobStatus;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);
}
