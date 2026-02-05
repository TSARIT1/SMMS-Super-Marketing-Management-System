package in.main.service;

import java.util.List;
import java.util.Map;

import in.main.entities.EmailLog;
import in.main.entities.EmailTemplate;

public interface EmailService {

    // Template Management
    EmailTemplate createTemplate(EmailTemplate template);
    EmailTemplate updateTemplate(Long templateId, EmailTemplate template);
    void deleteTemplate(Long templateId);
    EmailTemplate getTemplateById(Long templateId);
    List<EmailTemplate> getAllTemplates();
    List<EmailTemplate> getTemplatesByType(EmailTemplate.EmailType emailType);
    EmailTemplate getActiveTemplateByType(EmailTemplate.EmailType emailType);

    // Email Sending
    EmailLog sendEmail(String to, String subject, String body);
    EmailLog sendEmail(String to, String subject, String body, boolean isHtml);
    EmailLog sendEmail(String to, String subject, String body, String templateName);
    EmailLog sendEmail(String to, String subject, String body, Map<String, Object> variables);
    EmailLog sendEmailWithTemplate(String to, EmailTemplate template, Map<String, Object> variables);

    // Bulk Email Operations
    List<EmailLog> sendBulkEmails(List<String> recipients, String subject, String body);
    List<EmailLog> sendBulkEmailsWithTemplate(List<String> recipients, EmailTemplate template, List<Map<String, Object>> variablesList);

    // Email Logging and Tracking
    EmailLog logEmail(EmailLog emailLog);
    EmailLog updateEmailStatus(Long emailLogId, EmailLog.EmailStatus status);
    EmailLog updateEmailStatus(Long emailLogId, EmailLog.EmailStatus status, String errorMessage);
    List<EmailLog> getEmailLogsByUser(Long userId);
    List<EmailLog> getEmailLogsByType(String emailType);
    List<EmailLog> getFailedEmails();

    // Email Content Processing
    String processTemplate(String templateBody, Map<String, Object> variables);
    String generateWelcomeEmailContent(String userName, String shopName);
    String generateSupportEmailContent(String userName, String ticketNumber, String status);
    String generateTicketUpdateEmailContent(String userName, String ticketNumber, String update);
    String generateMarketingEmailContent(String userName, String promotionDetails);
    String generatePlanUpgradeEmailContent(String userName, String planName, String benefits);
    String generatePlanPromotionEmailContent(String userName, String planName, String discount);

    // Convenience Email Helpers
    void sendWelcomeEmail(String to, String fullName, String email, String shopName, String professionalNumber);
    void sendResetPasswordLink(String to, String resetLink);
    void sendTicketCreatedEmail(String to, String userName, Long ticketId, String subject, String description, String priority, String assignedTo);
    void sendTicketResolvedEmail(String to, String userName, Long ticketId, String subject, String outcome);
    void sendTicketResponseEmail(String to, String userName, Long ticketId, String subject, String response, String status);

    // Email Validation and Utilities
    boolean isValidEmail(String email);
    String sanitizeHtmlContent(String htmlContent);
    String convertToPlainText(String htmlContent);

    // Retry Mechanism
    void retryFailedEmails();
    void scheduleEmailRetry(Long emailLogId);

    // Email Analytics
    Long getTotalEmailsSent();
    Long getEmailsSentToday();
    Double getEmailOpenRate();
    Double getEmailClickRate();
    Long getBounceRate();

    // Campaign Management
    void createEmailCampaign(String campaignName, List<String> recipients, EmailTemplate template);
    void sendCampaignEmails(String campaignName);

    // Unsubscribe Management
    boolean isUnsubscribed(String email);
    void unsubscribeEmail(String email);
    void resubscribeEmail(String email);
}
