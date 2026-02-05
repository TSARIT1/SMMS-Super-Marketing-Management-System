package in.main.service;

import java.util.List;

import in.main.entities.Job;
import in.main.entities.JobApplication;
import in.main.entities.JobApplication.ApplicationStatus;

public interface JobApplicationService {
    List<JobApplication> getAllApplications();
    List<JobApplication> getApplicationsByJob(Job job);
    JobApplication getApplicationById(Long id);
    JobApplication createApplication(JobApplication application);
    JobApplication updateApplicationStatus(Long id, ApplicationStatus status);
    void deleteApplication(Long id);
}
