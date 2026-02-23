package in.main.entities;

import java.time.Instant;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String preferredDemoTime;

    @Column(updatable = false)
    private Instant createdAt;

    // New fields for AI Sales & Marketing
    private String companyName;
    private String contactName;
    private String contactEmail;
    private String industry;
    private Integer companySize;
    private String region;
    private Double estimatedValue;
    private Integer score;
    private String status;
    private String source;
    private Integer followUpCount;
    private LocalDateTime lastContactedAt;
    private LocalDateTime closedAt;

    @PrePersist
    public void onCreate() {
        createdAt = Instant.now();
        if (status == null) status = "NEW";
        if (score == null) score = 50;
        if (followUpCount == null) followUpCount = 0;
    }
}
