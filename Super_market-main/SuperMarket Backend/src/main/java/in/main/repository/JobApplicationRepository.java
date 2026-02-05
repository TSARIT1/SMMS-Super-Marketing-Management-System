package in.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.main.entities.Job;
import in.main.entities.JobApplication;
import in.main.entities.JobApplication.ApplicationStatus;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJob(Job job);
    List<JobApplication> findByJobOrderByAppliedAtDesc(Job job);
    List<JobApplication> findByStatus(ApplicationStatus status);
    List<JobApplication> findByStatusOrderByAppliedAtDesc(ApplicationStatus status);
}
