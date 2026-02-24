package in.main.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3001", "http://localhost:3001", "https://smms.tsaritservices.com"}, allowCredentials = "true")
public class DemoController {

    private static final Logger logger = LoggerFactory.getLogger(DemoController.class);
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDemo() {
        // No timeout (0L) so client controls disconnect
        final SseEmitter emitter = new SseEmitter(0L);

        final ScheduledExecutorService exec = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "demo-sse-thread");
            t.setDaemon(true);
            return t;
        });

        final AtomicInteger counter = new AtomicInteger(0);

        // Send an initial comment/event to establish the connection
        try {
            emitter.send(SseEmitter.event().comment("demo stream connected"));
        } catch (IOException ignored) {
        }

        exec.scheduleAtFixedRate(() -> {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("todaySales", 5000 + (int)(Math.random() * 2000));
                payload.put("pendingOrders", 5 + (int)(Math.random() * 50));
                payload.put("activeStores", 50 + (int)(Math.random() * 150));
                payload.put("tick", counter.incrementAndGet());

                String json = mapper.writeValueAsString(payload);

                emitter.send(SseEmitter.event()
                    .name("demo-stats")
                    .data(json, MediaType.APPLICATION_JSON));
            } catch (IOException ex) {
                logger.debug("SSE send failed, closing emitter: {}", ex.getMessage());
                try {
                    emitter.completeWithError(ex);
                } finally {
                    exec.shutdownNow();
                }
            }
        }, 0, 1, TimeUnit.SECONDS);

        emitter.onCompletion(() -> {
            logger.debug("Demo SSE completed by client");
            exec.shutdownNow();
        });

        emitter.onTimeout(() -> {
            logger.debug("Demo SSE timed out");
            emitter.complete();
            exec.shutdownNow();
        });

        return emitter;
    }
}
