package in.main.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.main.entities.LandingPage;
import in.main.service.LandingPageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LandingPageController {

    private final LandingPageService service;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(LandingPageController.class);

    @GetMapping("/landing")
    public ResponseEntity<LandingPage> getLanding() {
        logger.info("Received request for landing page data");
        try {
            LandingPage lp = service.getLanding();
            if (lp == null) {
                logger.warn("Landing page data is null");
                return ResponseEntity.notFound().build();
            }
            logger.info("Returning landing page data");
            return ResponseEntity.ok(lp);
        } catch (Exception e) {
            logger.error("Error retrieving landing page data", e);
            return ResponseEntity.badRequest().build();
        }
    }

}
