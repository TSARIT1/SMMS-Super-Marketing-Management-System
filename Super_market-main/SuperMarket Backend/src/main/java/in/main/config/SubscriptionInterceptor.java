package in.main.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import in.main.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SubscriptionInterceptor implements HandlerInterceptor {

    @Autowired
    private SubscriptionService subscriptionService;

    private Long resolveUserId(HttpServletRequest req) {
        // 1. Check query parameter (e.g., ?userId=6)
        String param = req.getParameter("userId");
        if (param != null && !param.isBlank()) {
            try { return Long.valueOf(param); } catch (Exception ignored) {}
        }
        // 2. Check custom header
        String header = req.getHeader("userId");
        if (header != null && !header.isBlank()) {
            try { return Long.valueOf(header); } catch (Exception ignored) {}
        }
        // 3. Check JWT SecurityContext
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                Object principal = auth.getPrincipal();
                if (principal instanceof Long) return (Long) principal;
                if (principal instanceof String) return Long.valueOf((String) principal);
            }
        } catch (Exception ignored) {}
        return null;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        Long uid = resolveUserId(request);
        if (uid == null) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication required\"}");
            return false;
        }
        boolean active = false;
        try { active = subscriptionService.isSubscriptionActive(uid); } catch (Exception ignored) {}
        if (!active) {
            response.setStatus(402);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Subscription required\",\"message\":\"Please subscribe to a plan to continue\"}");
            return false;
        }
        return true;
    }
}
