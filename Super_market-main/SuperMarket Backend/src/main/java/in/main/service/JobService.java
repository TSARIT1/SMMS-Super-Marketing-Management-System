package in.main.service;

import java.util.List;

import in.main.entities.Job;
import in.main.entities.Job.JobStatus;

public interface JobService {
    List<Job> getAllJobs();
    List<Job> getOpenJobs();
    Job getJobById(Long id);
    Job createJob(Job job);
    Job updateJob(Long id, Job job);
    void deleteJob(Long id);
    Job updateJobStatus(Long id, JobStatus status);
}
