package in.main.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import in.main.entities.EmailLog;
import in.main.entities.EmailTemplate;
import in.main.repository.EmailLogRepository;
import in.main.repository.EmailTemplateRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    private static final String FROM_EMAIL = "info@tsaritservices.com";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    // Template Management
    @Override
    public EmailTemplate createTemplate(EmailTemplate template) {
        template.setCreatedBy("SYSTEM");
        template.setUpdatedBy("SYSTEM");
        return emailTemplateRepository.save(template);
    }

    @Override
    public EmailTemplate updateTemplate(Long templateId, EmailTemplate template) {
        if (templateId == null) throw new IllegalArgumentException("Template ID cannot be null");
        Optional<EmailTemplate> existing = emailTemplateRepository.findById(templateId);
        if (existing.isPresent()) {
            EmailTemplate updated = existing.get();
            updated.setSubject(template.getSubject());
            updated.setBody(template.getBody());
            updated.setTemplateName(template.getTemplateName());
            updated.setDescription(template.getDescription());
            updated.setStatus(template.getStatus());
            updated.setUpdatedBy("SYSTEM");
            return emailTemplateRepository.save(updated);
        }
        throw new RuntimeException("Template not found");
    }

    @Override
    public void deleteTemplate(Long templateId) {
        if (templateId != null) {
            emailTemplateRepository.deleteById(templateId);
        }
    }

    @Override
    public EmailTemplate getTemplateById(Long templateId) {
        if (templateId == null) throw new IllegalArgumentException("Template ID cannot be null");
        return emailTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Override
    public List<EmailTemplate> getAllTemplates() {
        return emailTemplateRepository.findAll();
    }

    @Override
    public List<EmailTemplate> getTemplatesByType(EmailTemplate.EmailType emailType) {
        return emailTemplateRepository.findByEmailType(emailType);
    }

    @Override
    public EmailTemplate getActiveTemplateByType(EmailTemplate.EmailType emailType) {
        List<EmailTemplate> templates = emailTemplateRepository.findActiveTemplatesByType(emailType);
        return templates.isEmpty() ? null : templates.get(0);
    }

    // Email Sending
    @Override
    @Async
    public EmailLog sendEmail(String to, String subject, String body) {
        return sendEmail(to, subject, body, true);
    }

    @Override
    @Async
    public EmailLog sendEmail(String to, String subject, String body, boolean isHtml) {
        if (!isValidEmail(to)) {
            throw new IllegalArgumentException("Invalid email address: " + to);
        }

        EmailLog emailLog = new EmailLog();
        emailLog.setRecipientEmail(to);
        emailLog.setSubject(subject);
        emailLog.setBody(body);
        emailLog.setStatus(EmailLog.EmailStatus.PENDING);
        emailLog.setPriority(EmailLog.EmailPriority.NORMAL);
        emailLog.setSentBy(1L); // System user
        emailLog.setSentByName("SuperMart System");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            if (to != null) helper.setTo(to);
            if (subject != null) helper.setSubject(subject);
            if (body != null) helper.setText(body, isHtml);

            mailSender.send(message);

            emailLog.setStatus(EmailLog.EmailStatus.SENT);
            emailLog.setSentAt(LocalDateTime.now());

        } catch (MessagingException e) {
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
        }

        return emailLogRepository.save(emailLog);
    }

    @Override
    @Async
    public EmailLog sendEmail(String to, String subject, String body, String templateName) {
        // Find template by name and use it
        EmailTemplate template = emailTemplateRepository.findByTemplateName(templateName)
                .orElseThrow(() -> new RuntimeException("Template not found: " + templateName));
        return sendEmailWithTemplate(to, template, Map.of());
    }

    @Override
    @Async
    public EmailLog sendEmail(String to, String subject, String body, Map<String, Object> variables) {
        String processedSubject = processTemplate(subject, variables);
        String processedBody = processTemplate(body, variables);
        return sendEmail(to, processedSubject, processedBody, true);
    }

    @Override
    @Async
    public EmailLog sendEmailWithTemplate(String to, EmailTemplate template, Map<String, Object> variables) {
        String processedSubject = processTemplate(template.getSubject(), variables);
        String processedBody = processTemplate(template.getBody(), variables);

        EmailLog emailLog = sendEmail(to, processedSubject, processedBody, template.getIsHtml());
        emailLog.setEmailType(template.getEmailType().toString());
        emailLog.setTemplateName(template.getTemplateName());
        emailLog.setIsAiGenerated(template.getIsAiGenerated());

        return emailLogRepository.save(emailLog);
    }

    @Override
    @Async
    public List<EmailLog> sendBulkEmails(List<String> recipients, String subject, String body) {
        return recipients.stream()
                .map(email -> sendEmail(email, subject, body))
                .toList();
    }

    @Override
    @Async
    public List<EmailLog> sendBulkEmailsWithTemplate(List<String> recipients, EmailTemplate template, List<Map<String, Object>> variablesList) {
        java.util.List<EmailLog> logs = new java.util.ArrayList<>();
        for (int i = 0; i < recipients.size(); i++) {
            String to = recipients.get(i);
            Map<String, Object> vars = (variablesList != null && variablesList.size() > i) ? variablesList.get(i) : Map.of();
            logs.add(sendEmailWithTemplate(to, template, vars));
        }
        return logs;
    }

    // Email Logging and Tracking
    @Override
    public EmailLog logEmail(EmailLog emailLog) {
        return emailLogRepository.save(emailLog);
    }

    @Override
    public EmailLog updateEmailStatus(Long emailLogId, EmailLog.EmailStatus status) {
        return updateEmailStatus(emailLogId, status, null);
    }

    @Override
    public EmailLog updateEmailStatus(Long emailLogId, EmailLog.EmailStatus status, String errorMessage) {
        if (emailLogId == null) throw new IllegalArgumentException("Email Log ID cannot be null");
        Optional<EmailLog> existing = emailLogRepository.findById(emailLogId);
        if (existing.isPresent()) {
            EmailLog emailLog = existing.get();
            emailLog.setStatus(status);
            if (errorMessage != null) {
                emailLog.setErrorMessage(errorMessage);
            }
            if (status == EmailLog.EmailStatus.SENT) {
                emailLog.setSentAt(LocalDateTime.now());
            } else if (status == EmailLog.EmailStatus.DELIVERED) {
                emailLog.setDeliveredAt(LocalDateTime.now());
            }
            return emailLogRepository.save(emailLog);
        }
        throw new RuntimeException("Email log not found");
    }

    @Override
    public List<EmailLog> getEmailLogsByUser(Long userId) {
        return emailLogRepository.findByUserId(userId);
    }

    @Override
    public List<EmailLog> getEmailLogsByType(String emailType) {
        return emailLogRepository.findByEmailType(emailType);
    }

    @Override
    public List<EmailLog> getFailedEmails() {
        return emailLogRepository.findByStatus(EmailLog.EmailStatus.FAILED);
    }

    // Email Content Processing
    @Override
    public String processTemplate(String templateBody, Map<String, Object> variables) {
        if (templateBody == null || variables == null) {
            return templateBody;
        }

        String processed = templateBody;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            processed = processed.replace(placeholder, value);
        }
        return processed;
    }

    @Override
    public String generateWelcomeEmailContent(String userName, String shopName) {
        return String.format(
            "<h2>Welcome to SuperMart, %s!</h2>" +
            "<p>Thank you for joining SuperMart. Your shop '%s' is now ready to start selling.</p>" +
            "<p>Get started by exploring our dashboard and setting up your inventory.</p>" +
            "<p>Best regards,<br>The SuperMart Team</p>",
            userName, shopName
        );
    }

    @Override
    public String generateSupportEmailContent(String userName, String ticketNumber, String status) {
        return String.format(
            "<h2>Support Ticket Update</h2>" +
            "<p>Dear %s,</p>" +
            "<p>Your support ticket #%s status has been updated to: <strong>%s</strong></p>" +
            "<p>Our team is working to resolve your issue. We'll keep you updated on the progress.</p>" +
            "<p>Best regards,<br>SuperMart Support Team</p>",
            userName, ticketNumber, status
        );
    }

    @Override
    public String generateTicketUpdateEmailContent(String userName, String ticketNumber, String update) {
        return String.format(
            "<h2>Ticket Update - #%s</h2>" +
            "<p>Dear %s,</p>" +
            "<p>We've updated your ticket with the following information:</p>" +
            "<p>%s</p>" +
            "<p>Please check your account for more details.</p>" +
            "<p>Best regards,<br>SuperMart Support</p>",
            ticketNumber, userName, update
        );
    }

    @Override
    public String generateMarketingEmailContent(String userName, String promotionDetails) {
        return String.format(
            "<h2>Special Offer for %s!</h2>" +
            "<p>Don't miss out on our latest promotion:</p>" +
            "<p>%s</p>" +
            "<p>Visit your dashboard to take advantage of this limited-time offer.</p>" +
            "<p>Best regards,<br>SuperMart Marketing Team</p>",
            userName, promotionDetails
        );
    }

    @Override
    public String generatePlanUpgradeEmailContent(String userName, String planName, String benefits) {
        return String.format(
            "<h2>Upgrade to %s Plan, %s!</h2>" +
            "<p>Take your business to the next level with our %s plan:</p>" +
            "<p>%s</p>" +
            "<p>Upgrade now and see the difference in your sales performance.</p>" +
            "<p>Best regards,<br>SuperMart Team</p>",
            planName, userName, planName, benefits
        );
    }

    @Override
    public String generatePlanPromotionEmailContent(String userName, String planName, String discount) {
        return String.format(
            "<h2>Limited Time: %s Off %s Plan!</h2>" +
            "<p>Dear %s,</p>" +
            "<p>Get %s off our %s plan for a limited time!</p>" +
            "<p>This exclusive offer won't last long. Upgrade today and save big.</p>" +
            "<p>Best regards,<br>SuperMart Promotions</p>",
            discount, planName, userName, discount, planName
        );
    }

    // Email Validation and Utilities
    @Override
    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    @Override
    public String sanitizeHtmlContent(String htmlContent) {
        if (htmlContent == null) return null;
        // Basic HTML sanitization - remove script tags and other potentially dangerous elements
        return htmlContent.replaceAll("<script[^>]*>.*?</script>", "")
                         .replaceAll("<[^>]+>", "");
    }

    @Override
    public String convertToPlainText(String htmlContent) {
        if (htmlContent == null) return null;
        // Simple HTML to text conversion
        return htmlContent.replaceAll("<[^>]+>", "").replaceAll("&nbsp;", " ")
                         .replaceAll("&amp;", "&").replaceAll("<", "<")
                         .replaceAll(">", ">").trim();
    }

    // Retry Mechanism
    @Override
    @Async
    public void retryFailedEmails() {
        List<EmailLog> failedEmails = emailLogRepository.findEmailsForRetry(LocalDateTime.now());
        for (EmailLog emailLog : failedEmails) {
            if (emailLog.getRetryCount() < emailLog.getMaxRetries()) {
                try {
                    // Retry sending logic here
                    emailLog.setRetryCount(emailLog.getRetryCount() + 1);
                    emailLog.setNextRetryAt(LocalDateTime.now().plusHours(1));
                    emailLogRepository.save(emailLog);
                } catch (Exception e) {
                    emailLog.setErrorMessage("Retry failed: " + e.getMessage());
                    emailLogRepository.save(emailLog);
                }
            }
        }
    }

    @Override
    public void scheduleEmailRetry(Long emailLogId) {
        if (emailLogId == null) return;
        Optional<EmailLog> emailLog = emailLogRepository.findById(emailLogId);
        if (emailLog.isPresent()) {
            EmailLog log = emailLog.get();
            log.setNextRetryAt(LocalDateTime.now().plusHours(1));
            emailLogRepository.save(log);
        }
    }

    // Email Analytics
    @Override
    public Long getTotalEmailsSent() {
        return emailLogRepository.count();
    }

    @Override
    public Long getEmailsSentToday() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return emailLogRepository.countByStatusAndDateRange(EmailLog.EmailStatus.SENT, startOfDay, endOfDay);
    }

    @Override
    public Double getEmailOpenRate() {
        List<EmailLog> deliveredEmails = emailLogRepository.findByStatus(EmailLog.EmailStatus.DELIVERED);
        if (deliveredEmails.isEmpty()) return 0.0;

        long openedCount = deliveredEmails.stream().filter(email -> Boolean.TRUE.equals(email.getIsOpened())).count();
        return (double) openedCount / deliveredEmails.size() * 100;
    }

    @Override
    public Double getEmailClickRate() {
        List<EmailLog> openedEmails = emailLogRepository.findByStatus(EmailLog.EmailStatus.DELIVERED)
                .stream().filter(email -> Boolean.TRUE.equals(email.getIsOpened())).toList();
        if (openedEmails.isEmpty()) return 0.0;

        long clickedCount = openedEmails.stream().filter(email -> Boolean.TRUE.equals(email.getIsClicked())).count();
        return (double) clickedCount / openedEmails.size() * 100;
    }

    @Override
    public Long getBounceRate() {
        long totalSent = emailLogRepository.countByStatusAndDateRange(
            EmailLog.EmailStatus.SENT, LocalDateTime.now().minusDays(30), LocalDateTime.now());
        long bounced = emailLogRepository.countBouncedEmails(LocalDateTime.now().minusDays(30), LocalDateTime.now());

        return totalSent == 0 ? 0 : bounced * 100 / totalSent;
    }

    // Campaign Management
    @Override
    public void createEmailCampaign(String campaignName, List<String> recipients, EmailTemplate template) {
        // Implementation for campaign creation
        // This would typically involve scheduling and batch processing
    }

    @Override
    public void sendCampaignEmails(String campaignName) {
        // Implementation for sending campaign emails
    }

    // Unsubscribe Management
    @Override
    public boolean isUnsubscribed(String email) {
        // Implementation for unsubscribe checking
        return false; // Placeholder
    }

    @Override
    public void unsubscribeEmail(String email) {
        // Implementation for unsubscribe
    }

    @Override
    public void resubscribeEmail(String email) {
        // Implementation for resubscribe
    }

    @Override
    public void sendTicketResponseEmail(String to, String userName, Long ticketId, String subject, String response, String status) {
        String emailContent = String.format(
            "<h2>Ticket Response - #%d</h2>" +
            "<p>Dear %s,</p>" +
            "<p>We've responded to your support ticket #%d:</p>" +
            "<div style='background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;'>%s</div>" +
            "<p><strong>Status:</strong> %s</p>" +
            "<p>If you have any further questions, please reply to this email or check your ticket in the dashboard.</p>" +
            "<p>Best regards,<br>SuperMart Support Team</p>",
            ticketId, userName, ticketId, response, status
        );

        sendEmail(to, subject, emailContent, true);
    }

    @Override
    public void sendTicketResolvedEmail(String to, String userName, Long ticketId, String subject, String outcome) {
        String emailContent = String.format(
            "<h2>Ticket Resolved - #%d</h2>" +
            "<p>Dear %s,</p>" +
            "<p>Great news! Your support ticket #%d has been resolved.</p>" +
            "<div style='background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>%s</div>" +
            "<p>We're glad we could help resolve your issue. If you have any further questions or need additional assistance, please don't hesitate to reach out.</p>" +
            "<p>Best regards,<br>SuperMart Support Team</p>",
            ticketId, userName, ticketId, outcome
        );

        sendEmail(to, subject, emailContent, true);
    }

    @Override
    public void sendWelcomeEmail(String to, String fullName, String email, String shopName, String professionalNumber) {
        String subject = "Welcome to SuperMart!";
        String body = String.format(
            "<h2>Welcome to SuperMart, %s!</h2>" +
            "<p>Welcome to SuperMart. Your shop '%s' is now ready.</p>" +
            "<p>Account Email: %s</p>" +
            "<p>Professional Number: %s</p>" +
            "<p>You can now login with your credentials.</p>" +
            "<p>Best regards,<br>SuperMart Team</p>",
            fullName, shopName, email, professionalNumber
        );
        sendEmail(to, subject, body, true);
    }

    @Override
    public void sendResetPasswordLink(String to, String resetLink) {
        String subject = "Reset Your SuperMart Password";
        String emailContent = String.format(
            "<h2>Password Reset Request</h2>" +
            "<p>Dear User,</p>" +
            "<p>You have requested to reset your password for your SuperMart account.</p>" +
            "<p>Please click the link below to reset your password:</p>" +
            "<p><a href='%s' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>" +
            "<p>This link will expire in 24 hours for security reasons.</p>" +
            "<p>If you did not request this password reset, please ignore this email.</p>" +
            "<p>Best regards,<br>SuperMart Support Team</p>",
            resetLink
        );

        sendEmail(to, subject, emailContent, true);
    }

    @Override
    public void sendTicketCreatedEmail(String to, String userName, Long ticketId, String subject, String description, String priority, String assignedTo) {
        String emailContent = String.format(
            "<h2>New Support Ticket Created - #%d</h2>" +
            "<p>Dear %s,</p>" +
            "<p>Thank you for submitting your support ticket. We've received your request and our team will assist you shortly.</p>" +
            "<div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;'>" +
            "<p><strong>Ticket ID:</strong> #%d</p>" +
            "<p><strong>Subject:</strong> %s</p>" +
            "<p><strong>Description:</strong> %s</p>" +
            "<p><strong>Priority:</strong> %s</p>" +
            "<p><strong>Assigned To:</strong> %s</p>" +
            "</div>" +
            "<p>You can track the progress of your ticket in your dashboard. We'll send you updates as we work on resolving your issue.</p>" +
            "<p>Best regards,<br>SuperMart Support Team</p>",
            ticketId, userName, ticketId, subject, description, priority, assignedTo
        );

        sendEmail(to, "Support Ticket Created: " + subject, emailContent, true);
    }
}
