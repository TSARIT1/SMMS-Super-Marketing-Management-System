


package in.main.service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

@Service
public class LoadBalancerService {

    private final Map<String, AtomicInteger> loadCounters = new ConcurrentHashMap<>();
    private final Map<String, Integer> maxLoads = new ConcurrentHashMap<>();

    public LoadBalancerService() {
        // Initialize load counters and max loads
        loadCounters.put("api", new AtomicInteger(0));
        loadCounters.put("ai", new AtomicInteger(0));
        loadCounters.put("backend", new AtomicInteger(0));
        loadCounters.put("database", new AtomicInteger(0));

        maxLoads.put("api", 100);
        maxLoads.put("ai", 50);
        maxLoads.put("backend", 80);
        maxLoads.put("database", 200);
    }

    public Map<String, Object> getLoadStatus() {
        Map<String, Object> status = new HashMap<>();

        for (String service : loadCounters.keySet()) {
            int currentLoad = loadCounters.get(service).get();
            int maxLoad = maxLoads.get(service);
            double loadPercentage = (double) currentLoad / maxLoad * 100;

            Map<String, Object> serviceStatus = new HashMap<>();
            serviceStatus.put("current", currentLoad);
            serviceStatus.put("max", maxLoad);
            serviceStatus.put("percentage", Math.round(loadPercentage * 100.0) / 100.0);
            serviceStatus.put("status", getLoadStatus(loadPercentage));

            status.put(service, serviceStatus);
        }

        // Overall system status
        double avgLoad = status.values().stream()
            .mapToDouble(s -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) s;
                return (Double) map.get("percentage");
            })
            .average()
            .orElse(0.0);

        status.put("overall", Map.of(
            "averageLoad", Math.round(avgLoad * 100.0) / 100.0,
            "status", getLoadStatus(avgLoad)
        ));

        return status;
    }

    private String getLoadStatus(double percentage) {
        if (percentage < 50) return "low";
        if (percentage < 80) return "medium";
        if (percentage < 95) return "high";
        return "critical";
    }

    public boolean canHandleRequest(String service) {
        AtomicInteger counter = loadCounters.get(service);
        if (counter == null) return true;

        int currentLoad = counter.get();
        int maxLoad = maxLoads.get(service);

        return currentLoad < maxLoad;
    }

    public void incrementLoad(String service) {
        AtomicInteger counter = loadCounters.get(service);
        if (counter != null) {
            counter.incrementAndGet();
        }
    }

    public void decrementLoad(String service) {
        AtomicInteger counter = loadCounters.get(service);
        if (counter != null) {
            counter.decrementAndGet();
        }
    }

    public String balanceLoad() {
        Map<String, Object> status = getLoadStatus();

        // Find the least loaded service
        String leastLoaded = "api";
        double minLoad = Double.MAX_VALUE;

        for (String service : loadCounters.keySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> serviceStatus = (Map<String, Object>) status.get(service);
            double load = (Double) serviceStatus.get("percentage");
            if (load < minLoad) {
                minLoad = load;
                leastLoaded = service;
            }
        }

        return "Load balanced to: " + leastLoaded + " (load: " + minLoad + "%)";
    }

    public void resetLoad(String service) {
        AtomicInteger counter = loadCounters.get(service);
        if (counter != null) {
            counter.set(0);
        }
    }

    public void updateMaxLoad(String service, int maxLoad) {
        maxLoads.put(service, maxLoad);
    }
}
