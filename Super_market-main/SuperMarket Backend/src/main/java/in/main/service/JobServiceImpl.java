package in.main.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.entities.Job;
import in.main.entities.Job.JobStatus;
import in.main.repository.JobRepository;

@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public List<Job> getOpenJobs() {
        return jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.OPEN);
    }

    @Override
    public Job getJobById(Long id) {
        Optional<Job> job = jobRepository.findById(id);
        return job.orElse(null);
    }

    @Override
    public Job createJob(Job job) {
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    @Override
    public Job updateJob(Long id, Job jobDetails) {
        Optional<Job> optionalJob = jobRepository.findById(id);
        if (optionalJob.isPresent()) {
            Job job = optionalJob.get();
            job.setTitle(jobDetails.getTitle());
            job.setDescription(jobDetails.getDescription());
            job.setRequirements(jobDetails.getRequirements());
            job.setLocation(jobDetails.getLocation());
            job.setSalary(jobDetails.getSalary());
            job.setType(jobDetails.getType());
            job.setStatus(jobDetails.getStatus());
            job.setUpdatedAt(LocalDateTime.now());
            return jobRepository.save(job);
        }
        return null;
    }

    @Override
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    @Override
    public Job updateJobStatus(Long id, JobStatus status) {
        Optional<Job> optionalJob = jobRepository.findById(id);
        if (optionalJob.isPresent()) {
            Job job = optionalJob.get();
            job.setStatus(status);
            job.setUpdatedAt(LocalDateTime.now());
            return jobRepository.save(job);
        }
        return null;
    }
}
