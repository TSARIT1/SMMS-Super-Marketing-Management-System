package in.main.controller;

import in.main.entities.LandingPage;
import in.main.service.LandingPageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/landing")
public class AdminLandingController {

    @org.springframework.beans.factory.annotation.Autowired
    private LandingPageService service;

    @GetMapping
    public ResponseEntity<LandingPage> getForAdmin() {
        LandingPage lp = service.getLanding();
        return lp == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(lp);
    }

    @PutMapping
    public ResponseEntity<LandingPage> update(@Valid @RequestBody LandingPage payload) {
        LandingPage saved = service.save(payload);
        return ResponseEntity.ok(saved);
    }
}
