package in.main.controller;

import in.main.entities.SubscriptionPlan;
// Removed unused import
import in.main.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription-plans")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class SubscriptionPlanController {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    // Public endpoint - Get all active plans (for landing page and users)
    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionPlan>> getActivePlans() {
        try {
            List<SubscriptionPlan> plans = planRepository.findByIsActiveTrue();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Admin only - Get all plans (including inactive)
    @GetMapping("/all")
    public ResponseEntity<List<SubscriptionPlan>> getAllPlans() {
        try {
            List<SubscriptionPlan> plans = planRepository.findAll();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Admin only - Create new plan
    @PostMapping("/create")
    public ResponseEntity<?> createPlan(@RequestBody SubscriptionPlan plan, 
                                        @RequestHeader(value = "userId", required = false) Long adminId) {
        try {
            if (adminId != null) {
                plan.setCreatedBy(adminId);
                plan.setUpdatedBy(adminId);
            }
            SubscriptionPlan savedPlan = planRepository.save(plan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to create plan: " + e.getMessage()));
        }
    }

    // Admin only - Update plan
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan plan, 
                                        @RequestHeader(value = "userId", required = false) Long adminId) {
        try {
            return planRepository.findById(id)
                    .map(existingPlan -> {
                        existingPlan.setPlanName(plan.getPlanName());
                        existingPlan.setPrice(plan.getPrice());
                        existingPlan.setDurationDays(plan.getDurationDays());
                        existingPlan.setDescription(plan.getDescription());
                        existingPlan.setFeatures(plan.getFeatures());
                        existingPlan.setMaxProducts(plan.getMaxProducts());
                        existingPlan.setMaxUsers(plan.getMaxUsers());
                        existingPlan.setIsActive(plan.getIsActive());
                        existingPlan.setIsPopular(plan.getIsPopular());
                        existingPlan.setIconColor(plan.getIconColor());
                        if (adminId != null) {
                            existingPlan.setUpdatedBy(adminId);
                        }
                        
                        SubscriptionPlan updated = planRepository.save(existingPlan);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to update plan: " + e.getMessage()));
        }
    }

    // Admin only - Delete plan
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        try {
            if (planRepository.existsById(id)) {
                planRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Plan deleted successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to delete plan: " + e.getMessage()));
        }
    }

    // Admin only - Toggle plan active status
    @PatchMapping("/toggle-status/{id}")
    public ResponseEntity<?> togglePlanStatus(@PathVariable Long id, 
                                               @RequestHeader(value = "userId", required = false) Long adminId) {
        try {
            return planRepository.findById(id)
                    .map(plan -> {
                        plan.setIsActive(!plan.getIsActive());
                        if (adminId != null) {
                            plan.setUpdatedBy(adminId);
                        }
                        SubscriptionPlan updated = planRepository.save(plan);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to toggle plan status: " + e.getMessage()));
        }
    }
}
