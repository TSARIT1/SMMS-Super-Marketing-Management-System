package in.main;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class FreezeIntegrationTest {

    @LocalServerPort
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();

    @Test
    public void freeze_unfreeze_blockLogin() throws Exception {
        String registerUrl = "http://localhost:" + port + "/api/register";
        String registerBody = "{\"full_name\":\"Freeze Tester\",\"shop_name\":\"Freeze Shop\",\"shop_address\":\"Test\",\"email\":\"freeze-test@example.com\",\"phone\":\"9999999999\",\"password\":\"pass123\"}";

        HttpRequest regReq = HttpRequest.newBuilder()
                .uri(URI.create(registerUrl))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(registerBody))
                .build();

        HttpResponse<String> regRes = http.send(regReq, HttpResponse.BodyHandlers.ofString());
        assertThat(regRes.statusCode()).isBetween(200, 299);

        // Login as created user
        String loginUrl = "http://localhost:" + port + "/api/login";
        String loginBody = "{\"emailOrPhone\":\"freeze-test@example.com\",\"password\":\"pass123\"}";
        HttpRequest loginReq = HttpRequest.newBuilder().uri(URI.create(loginUrl)).header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(loginBody)).timeout(Duration.ofSeconds(10)).build();
        HttpResponse<String> loginRes = http.send(loginReq, HttpResponse.BodyHandlers.ofString());
        assertThat(loginRes.statusCode()).isBetween(200, 299);
        assertThat(loginRes.body()).contains("freeze-test@example.com");

        // Extract userId from response
        String body = loginRes.body();
        // crude parse for "id":<number>
        int idIdx = body.indexOf("\"id\":");
        assertThat(idIdx).isGreaterThan(-1);
        String afterId = body.substring(idIdx + 6);
        String digits = afterId.replaceAll("^\\s*", "").split("[,\\}]", 2)[0].trim();
        Long userId = Long.parseLong(digits);

        // Freeze account using admin Basic auth
        String adminAuth = java.util.Base64.getEncoder().encodeToString("admin@supermart.com:admin123".getBytes());
        String freezeUrl = "http://localhost:" + port + "/api/admin/users/" + userId + "/freeze";
        String freezeBody = "{\"reason\":\"Integration test freeze\", \"adminId\": 1}";

        HttpRequest freezeReq = HttpRequest.newBuilder().uri(URI.create(freezeUrl)).header("Content-Type","application/json").header("Authorization", "Basic " + adminAuth).PUT(HttpRequest.BodyPublishers.ofString(freezeBody)).timeout(Duration.ofSeconds(10)).build();
        HttpResponse<String> freezeRes = http.send(freezeReq, HttpResponse.BodyHandlers.ofString());
        assertThat(freezeRes.statusCode()).isBetween(200, 299);

        // Try login again - expect 403
        HttpResponse<String> loginRes2 = http.send(loginReq, HttpResponse.BodyHandlers.ofString());
        assertThat(loginRes2.statusCode()).isEqualTo(403);
        assertThat(loginRes2.body()).contains("Account Frozen");

        // Unfreeze
        String unfreezeUrl = "http://localhost:" + port + "/api/admin/users/" + userId + "/unfreeze";
        HttpRequest unfreezeReq = HttpRequest.newBuilder().uri(URI.create(unfreezeUrl)).header("Content-Type","application/json").header("Authorization", "Basic " + adminAuth).PUT(HttpRequest.BodyPublishers.ofString("{}")).timeout(Duration.ofSeconds(10)).build();
        HttpResponse<String> unfreezeRes = http.send(unfreezeReq, HttpResponse.BodyHandlers.ofString());
        assertThat(unfreezeRes.statusCode()).isBetween(200, 299);

        // Login should succeed again
        HttpResponse<String> loginRes3 = http.send(loginReq, HttpResponse.BodyHandlers.ofString());
        assertThat(loginRes3.statusCode()).isBetween(200, 299);
        assertThat(loginRes3.body()).contains("freeze-test@example.com");
    }
}
