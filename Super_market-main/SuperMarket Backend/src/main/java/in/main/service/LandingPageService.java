package in.main.service;

import in.main.entities.LandingPage;
import in.main.repository.LandingPageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LandingPageService {

    private final LandingPageRepository repo;

    public LandingPage getLanding() {
        List<LandingPage> all = repo.findAll();
        if (!all.isEmpty()) return all.get(0);
        return null;
    }

    public LandingPage save(LandingPage landingPage) {
        // If an existing record exists, update it (keep singleton)
        LandingPage existing = getLanding();
        if (existing != null) {
            landingPage.setId(existing.getId());
        }
        return repo.save(landingPage);
    }

    @PostConstruct
    public void seedDefault() {
        if (getLanding() == null) {
            LandingPage d = new LandingPage();
            d.setHeroTitle("Transform Your Retail Business with TSAR IT SMMS");
            d.setHeroSubtitle("AI-powered, real-time supermarket operations—inventory, POS, analytics, and automation in one platform.");
            d.setHeroImageUrl("https://s3-alpha.figma.com/hub/file/5756596760/4a94ee92-e636-45d7-bdc2-ee4161a55553-cover.png");
            d.setCtaPrimaryText("Get a Demo");
            d.setCtaPrimaryUrl("/contact");
            d.setCtaSecondaryText("View Pricing");
            d.setCtaSecondaryUrl("/pricing");
            d.setFeaturesJson("[{\"title\":\"Advanced AI Forecasting\",\"desc\":\"Reduce stockouts & overstock with demand predictions.\"},{\"title\":\"Real-time Inventory Sync\",\"desc\":\"Instant updates across stores & counters.\"},{\"title\":\"Smart Reordering\",\"desc\":\"Automate supplier orders with minimal human intervention.\"}]");
            d.setSectionsJson("[]");
            repo.save(d);
        }
    }
}
