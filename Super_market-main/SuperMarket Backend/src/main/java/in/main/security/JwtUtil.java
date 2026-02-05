package in.main.security;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

    @Value("${jwt.secret:changeit-local-secret}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}") // 1 day
    private long expirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = secret.getBytes();
        // Ensure key is at least 256 bits (32 bytes). If shorter, derive a 256-bit key via SHA-256.
        if (keyBytes.length < 32) {
            try {
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                keyBytes = digest.digest(keyBytes);
            } catch (java.security.NoSuchAlgorithmException e) {
                // Fallback: pad or truncate to 32 bytes
                byte[] padded = new byte[32];
                System.arraycopy(secret.getBytes(), 0, padded, 0, Math.min(secret.getBytes().length, 32));
                keyBytes = padded;
            }
        }
        key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(exp)
                .addClaims(Map.of("email", email, "role", role))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
