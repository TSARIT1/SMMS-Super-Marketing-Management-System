package in.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.dto.DashboardResponse;
import in.main.service.DashboardService;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082"}, allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(@RequestParam Long userId) {
        return dashboardService.getDashboardData(userId);
    }
}
