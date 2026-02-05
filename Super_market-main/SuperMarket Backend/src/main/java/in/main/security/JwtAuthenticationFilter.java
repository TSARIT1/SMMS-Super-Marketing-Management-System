package in.main.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            // Skip preflight requests right away
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }
            String header = request.getHeader("Authorization");
            if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                Claims claims = jwtUtil.validateAndGetClaims(token);
                Long userId = Long.valueOf(claims.getSubject());
                String role = claims.get("role", String.class);
                // create simple authentication
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority("ROLE_"+role)));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ex) {
            // ignore and let security handle unauthenticated
        }
        filterChain.doFilter(request, response);
    }
}
