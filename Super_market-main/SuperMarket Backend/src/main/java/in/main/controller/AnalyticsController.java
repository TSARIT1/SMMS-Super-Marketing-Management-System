package in.main.controller;

import in.main.entities.AnalyticsEvent;
import in.main.repository.AnalyticsEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> body) {
        try {
            final String event = (String) body.get("event");
            final Object payload = body.get("payload");
            final String ts = (String) body.get("ts");

            if (event == null || event.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing 'event' field"));
            }

            AnalyticsEvent ev = new AnalyticsEvent();
            ev.setEvent(event);
            ev.setPayload(payload != null ? payload.toString() : null);
            if (ts != null) {
                try { ev.setTs(LocalDateTime.parse(ts)); } catch (Exception ignored) { ev.setTs(LocalDateTime.now()); }
            }
            analyticsEventRepository.save(ev);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}