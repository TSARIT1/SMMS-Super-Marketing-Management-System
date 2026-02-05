package in.main.controller;

import in.main.entities.EmailLog;
import in.main.entities.EmailTemplate;
import in.main.service.EmailService;
import in.main.service.EmailAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/emails")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailAIService emailAIService;

    // Template Management Endpoints
    @PostMapping("/templates")
    public ResponseEntity<EmailTemplate> createTemplate(@RequestBody EmailTemplate template) {
        EmailTemplate created = emailService.createTemplate(template);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<EmailTemplate> updateTemplate(@PathVariable Long id, @RequestBody EmailTemplate template) {
        template.setId(id);
        EmailTemplate updated = emailService.updateTemplate(id, template);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        emailService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/templates")
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        List<EmailTemplate> templates = emailService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<EmailTemplate> getTemplate(@PathVariable Long id) {
        EmailTemplate template = emailService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @GetMapping("/templates/type/{emailType}")
    public ResponseEntity<List<EmailTemplate>> getTemplatesByType(@PathVariable EmailTemplate.EmailType emailType) {
        List<EmailTemplate> templates = emailService.getTemplatesByType(emailType);
        return ResponseEntity.ok(templates);
    }

    // Email Sending Endpoints
    @PostMapping("/send")
    public ResponseEntity<EmailLog> sendEmail(@RequestBody Map<String, Object> emailRequest) {
        String to = (String) emailRequest.get("to");
        String subject = (String) emailRequest.get("subject");
        String body = (String) emailRequest.get("body");
        Boolean isHtml = (Boolean) emailRequest.getOrDefault("isHtml", true);

        EmailLog log = emailService.sendEmail(to, subject, body, isHtml);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/send-template")
    public ResponseEntity<EmailLog> sendEmailWithTemplate(@RequestBody Map<String, Object> request) {
        String to = (String) request.get("to");
        Long templateId = Long.valueOf(request.get("templateId").toString());
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");

        EmailTemplate template = emailService.getTemplateById(templateId);
        EmailLog log = emailService.sendEmailWithTemplate(to, template, variables);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<List<EmailLog>> sendBulkEmails(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> recipients = (List<String>) request.get("recipients");
        String subject = (String) request.get("subject");
        String body = (String) request.get("body");

        List<EmailLog> logs = emailService.sendBulkEmails(recipients, subject, body);
        return ResponseEntity.ok(logs);
    }

    // Email Log Endpoints
    @GetMapping("/logs")
    public ResponseEntity<Page<EmailLog>> getEmailLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String emailType,
            @RequestParam(required = false) EmailLog.EmailStatus status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<EmailLog> logs;

        if (emailType != null && status != null) {
            logs = emailService.getEmailLogsByType(emailType).stream()
                    .filter(log -> log.getStatus() == status)
                    .collect(java.util.stream.Collectors.toList())
                    .stream()
                    .skip(page * size)
                    .limit(size)
                    .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())));
        } else if (emailType != null) {
            logs = emailService.getEmailLogsByType(emailType).stream()
                    .skip(page * size)
                    .limit(size)
                    .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())));
        } else {
            // This would need to be implemented in the service for proper pagination
            logs = Page.empty();
        }

        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<EmailLog>> getUserEmailLogs(@PathVariable Long userId) {
        List<EmailLog> logs = emailService.getEmailLogsByUser(userId);
        return ResponseEntity.ok(logs);
    }

    @PutMapping("/logs/{id}/status")
    public ResponseEntity<EmailLog> updateEmailStatus(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        EmailLog.EmailStatus status = EmailLog.EmailStatus.valueOf((String) request.get("status"));
        String errorMessage = (String) request.get("errorMessage");

        EmailLog updated = emailService.updateEmailStatus(id, status, errorMessage);
        return ResponseEntity.ok(updated);
    }

    // AI Email Endpoints
    @PostMapping("/ai/generate-content")
    public ResponseEntity<String> generateAIContent(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.get("prompt");
        EmailTemplate.EmailType emailType = EmailTemplate.EmailType.valueOf((String) request.get("emailType"));

        String content = emailAIService.generateEmailContent(prompt, emailType);
        return ResponseEntity.ok(content);
    }

    @PostMapping("/ai/generate-template")
    public ResponseEntity<EmailTemplate> generateAITemplate(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.get("prompt");
        EmailTemplate.EmailType emailType = EmailTemplate.EmailType.valueOf((String) request.get("emailType"));

        EmailTemplate template = emailAIService.generateTemplateFromPrompt(prompt, emailType);
        return ResponseEntity.ok(template);
    }

    @PostMapping("/ai/optimize-template/{id}")
    public ResponseEntity<EmailTemplate> optimizeTemplate(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String goal = (String) request.get("goal");
        EmailTemplate template = emailService.getTemplateById(id);

        EmailTemplate optimized = emailAIService.optimizeExistingTemplate(template, goal);
        return ResponseEntity.ok(optimized);
    }

    // Analytics Endpoints
    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getEmailAnalytics() {
        Map<String, Object> analytics = Map.of(
            "totalEmailsSent", emailService.getTotalEmailsSent(),
            "emailsSentToday", emailService.getEmailsSentToday(),
            "emailOpenRate", emailService.getEmailOpenRate(),
            "emailClickRate", emailService.getEmailClickRate(),
            "bounceRate", emailService.getBounceRate()
        );
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/performance-report")
    public ResponseEntity<String> getPerformanceReport() {
        String report = emailAIService.generatePerformanceReport();
        return ResponseEntity.ok(report);
    }

    // Campaign Management
    @PostMapping("/campaigns")
    public ResponseEntity<Void> createCampaign(@RequestBody Map<String, Object> request) {
        String campaignName = (String) request.get("campaignName");
        @SuppressWarnings("unchecked")
        List<String> recipients = (List<String>) request.get("recipients");
        Long templateId = Long.valueOf(request.get("templateId").toString());

        EmailTemplate template = emailService.getTemplateById(templateId);
        emailService.createEmailCampaign(campaignName, recipients, template);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/campaigns/{campaignName}/send")
    public ResponseEntity<Void> sendCampaign(@PathVariable String campaignName) {
        emailService.sendCampaignEmails(campaignName);
        return ResponseEntity.ok().build();
    }

    // Utility Endpoints
    @PostMapping("/retry-failed")
    public ResponseEntity<Void> retryFailedEmails() {
        emailService.retryFailedEmails();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/templates/categories")
    public ResponseEntity<List<String>> getTemplateCategories() {
        List<String> categories = emailService.getAllTemplates().stream()
                .map(EmailTemplate::getCategory)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/types")
    public ResponseEntity<EmailTemplate.EmailType[]> getEmailTypes() {
        return ResponseEntity.ok(EmailTemplate.EmailType.values());
    }
}
