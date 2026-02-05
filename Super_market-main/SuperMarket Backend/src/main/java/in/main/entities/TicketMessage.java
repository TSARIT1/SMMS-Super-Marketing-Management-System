package in.main.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_messages")
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    public enum Sender {
        USER,
        ADMIN
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "sender", nullable = false)
    private Sender sender;

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TicketMessage() {}

    public TicketMessage(Ticket ticket, Sender sender, Long senderId, String message) {
        this.ticket = ticket;
        this.sender = sender;
        this.senderId = senderId;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public Sender getSender() { return sender; }
    public void setSender(Sender sender) { this.sender = sender; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TicketAttachment> attachments = new java.util.ArrayList<>();

    public java.util.List<TicketAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(java.util.List<TicketAttachment> attachments) {
        this.attachments = attachments;
    }

    public void addAttachment(TicketAttachment att) {
        this.attachments.add(att);
        att.setMessage(this);
    }
}