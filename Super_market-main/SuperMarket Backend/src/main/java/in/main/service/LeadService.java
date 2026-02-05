package in.main.service;

import in.main.entities.Lead;
import in.main.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final JavaMailSender mailSender;

    public Lead save(Lead lead) {
        Lead saved = leadRepository.save(lead);
        // Send notification email to sales (best-effort)
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo("info@tsaritservices.com");
            msg.setSubject("New demo request: " + (lead.getName() != null ? lead.getName() : ""));
            msg.setText("Name: " + lead.getName() + "\nEmail: " + lead.getEmail() + "\nPhone: " + lead.getPhone() + "\nStore: " + lead.getStoreName() + "\nMessage: " + lead.getMessage());
            mailSender.send(msg);
        } catch (Exception e) {
            // log but do not fail request
            System.err.println("Failed to send lead email: " + e.getMessage());
        }
        return saved;
    }
}
