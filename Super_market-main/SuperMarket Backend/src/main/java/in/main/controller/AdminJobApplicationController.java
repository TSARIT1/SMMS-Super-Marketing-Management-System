package in.main.controller;

import java.util.List;
import java.util.Map;

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

import in.main.entities.JobApplication;
import in.main.entities.JobApplication.ApplicationStatus;
import in.main.service.JobApplicationService;

@RestController
@RequestMapping("/api/admin/applications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:8081", "http://localhost:8082"}, allowCredentials = "true")
public class AdminJobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        List<JobApplication> applications = jobApplicationService.getAllApplications();
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
    public ResponseEntity<JobApplication> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        if (statusStr == null || statusStr.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            ApplicationStatus status = ApplicationStatus.valueOf(statusStr);
            JobApplication updatedApplication = jobApplicationService.updateApplicationStatus(id, status);
            if (updatedApplication == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedApplication);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
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