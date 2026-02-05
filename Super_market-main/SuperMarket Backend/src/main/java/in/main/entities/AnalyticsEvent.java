package in.main.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String event;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private LocalDateTime ts;

    private Long userId;

    @PrePersist
    protected void onCreate() {
        if (ts == null) ts = LocalDateTime.now();
    }

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public LocalDateTime getTs() { return ts; }
    public void setTs(LocalDateTime ts) { this.ts = ts; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}