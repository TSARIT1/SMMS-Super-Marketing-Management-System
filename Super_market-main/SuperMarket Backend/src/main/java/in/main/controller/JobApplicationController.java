package in.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.entities.Job;
import in.main.entities.JobApplication;
import in.main.service.JobApplicationService;
import in.main.service.JobService;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"}, allowCredentials = "true")
public class JobApplicationController {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobApplicationService jobApplicationService;

    @PostMapping("/{id}/apply")
    public ResponseEntity<JobApplication> applyForJob(@PathVariable Long id, @RequestBody JobApplication application) {
        Job job = jobService.getJobById(id);
        if (job == null || job.getStatus() != Job.JobStatus.OPEN) {
            return ResponseEntity.notFound().build();
        }

        application.setJob(job);
        JobApplication savedApplication = jobApplicationService.createApplication(application);
        return ResponseEntity.ok(savedApplication);
    }
}
