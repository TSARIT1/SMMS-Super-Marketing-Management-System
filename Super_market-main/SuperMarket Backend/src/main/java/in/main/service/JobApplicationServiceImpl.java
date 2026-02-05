package in.main.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.entities.Job;
import in.main.entities.JobApplication;
import in.main.entities.JobApplication.ApplicationStatus;
import in.main.repository.JobApplicationRepository;

@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Override
    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    @Override
    public List<JobApplication> getApplicationsByJob(Job job) {
        return jobApplicationRepository.findByJobOrderByAppliedAtDesc(job);
    }

    @Override
    public JobApplication getApplicationById(Long id) {
        Optional<JobApplication> application = jobApplicationRepository.findById(id);
        return application.orElse(null);
    }

    @Override
    public JobApplication createApplication(JobApplication application) {
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);
        return jobApplicationRepository.save(application);
    }

    @Override
    public JobApplication updateApplicationStatus(Long id, ApplicationStatus status) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(id);
        if (applicationOpt.isPresent()) {
            JobApplication application = applicationOpt.get();
            application.setStatus(status);
            return jobApplicationRepository.save(application);
        }
        return null;
    }

    @Override
    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }
}
