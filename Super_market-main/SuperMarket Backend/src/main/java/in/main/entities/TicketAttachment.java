package in.main.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_attachments")
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private TicketMessage message;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "stored_name", nullable = false)
    private String storedName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "size")
    private long size;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TicketAttachment() {}

    public TicketAttachment(TicketMessage message, String originalName, String storedName, String contentType, long size) {
        this.message = message;
        this.originalName = originalName;
        this.storedName = storedName;
        this.contentType = contentType;
        this.size = size;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TicketMessage getMessage() { return message; }
    public void setMessage(TicketMessage message) { this.message = message; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public String getStoredName() { return storedName; }
    public void setStoredName(String storedName) { this.storedName = storedName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}