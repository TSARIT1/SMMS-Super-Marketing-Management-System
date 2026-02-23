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

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHeroTitle() {
        return heroTitle;
    }

    public void setHeroTitle(String heroTitle) {
        this.heroTitle = heroTitle;
    }

    public String getHeroSubtitle() {
        return heroSubtitle;
    }

    public void setHeroSubtitle(String heroSubtitle) {
        this.heroSubtitle = heroSubtitle;
    }

    public String getHeroImageUrl() {
        return heroImageUrl;
    }

    public void setHeroImageUrl(String heroImageUrl) {
        this.heroImageUrl = heroImageUrl;
    }

    public String getCtaPrimaryText() {
        return ctaPrimaryText;
    }

    public void setCtaPrimaryText(String ctaPrimaryText) {
        this.ctaPrimaryText = ctaPrimaryText;
    }

    public String getCtaPrimaryUrl() {
        return ctaPrimaryUrl;
    }

    public void setCtaPrimaryUrl(String ctaPrimaryUrl) {
        this.ctaPrimaryUrl = ctaPrimaryUrl;
    }

    public String getCtaSecondaryText() {
        return ctaSecondaryText;
    }

    public void setCtaSecondaryText(String ctaSecondaryText) {
        this.ctaSecondaryText = ctaSecondaryText;
    }

    public String getCtaSecondaryUrl() {
        return ctaSecondaryUrl;
    }

    public void setCtaSecondaryUrl(String ctaSecondaryUrl) {
        this.ctaSecondaryUrl = ctaSecondaryUrl;
    }

    public String getFeaturesJson() {
        return featuresJson;
    }

    public void setFeaturesJson(String featuresJson) {
        this.featuresJson = featuresJson;
    }

    public String getSectionsJson() {
        return sectionsJson;
    }

    public void setSectionsJson(String sectionsJson) {
        this.sectionsJson = sectionsJson;
    }
}
