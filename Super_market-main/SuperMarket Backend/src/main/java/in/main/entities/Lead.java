package in.main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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

    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = Instant.now();
    }
}
