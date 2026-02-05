package in.main.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "landing_page")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String heroTitle;
    private String heroSubtitle;
    private String heroImageUrl;

    private String ctaPrimaryText;
    private String ctaPrimaryUrl;

    private String ctaSecondaryText;
    private String ctaSecondaryUrl;

    @Column(columnDefinition = "TEXT")
    private String featuresJson; // JSON array of feature objects: [{ title, desc, icon }]

    @Column(columnDefinition = "TEXT")
    private String sectionsJson; // Additional sections in JSON if required
}
