package in.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.entities.Job;
import in.main.entities.JobApplication;
import in.main.entities.JobApplication.ApplicationStatus;
import in.main.service.JobApplicationService;
import in.main.service.JobService;

@RestController
@RequestMapping("/api/admin/applications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"}, allowCredentials = "true")
public class AdminJobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        List<JobApplication> applications = jobApplicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByJob(@PathVariable Long jobId) {
        Job job = jobService.getJobById(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        List<JobApplication> applications = jobApplicationService.getApplicationsByJob(job);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@PathVariable Long id) {
        JobApplication application = jobApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(application);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(@PathVariable Long id, @RequestBody ApplicationStatus status) {
        JobApplication updatedApplication = jobApplicationService.updateApplicationStatus(id, status);
        if (updatedApplication == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedApplication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        JobApplication application = jobApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
