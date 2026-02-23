package in.main;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class DevSeedIntegrationTest {

    @LocalServerPort
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();

    @Test
    public void seedAndFetch_shouldReturnUsersAndAuditLogs() throws Exception {
        String seedUrl = "http://localhost:" + port + "/api/dev/seed";
        String basicAuth = java.util.Base64.getEncoder().encodeToString("admin@supermart.com:admin123".getBytes());
        HttpRequest seedReq = HttpRequest.newBuilder()
            .uri(URI.create(seedUrl))
            .timeout(Duration.ofSeconds(10))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"users\":3}"))
            .build();
        HttpResponse<String> seedRes = http.send(seedReq, HttpResponse.BodyHandlers.ofString());
        assertThat(seedRes.statusCode()).isBetween(200, 299);
        assertThat(seedRes.body()).contains("created");

        String usersUrl = "http://localhost:" + port + "/api/admin/users";
        HttpRequest usersReq = HttpRequest.newBuilder().uri(URI.create(usersUrl)).header("Authorization", "Basic " + basicAuth).GET().build();
        HttpResponse<String> usersRes = http.send(usersReq, HttpResponse.BodyHandlers.ofString());
        assertThat(usersRes.statusCode()).isBetween(200, 299);
        assertThat(usersRes.body()).contains("dev.user.1");

        String auditUrl = "http://localhost:" + port + "/api/admin/audit-logs";
        HttpRequest auditReq = HttpRequest.newBuilder().uri(URI.create(auditUrl)).header("Authorization", "Basic " + basicAuth).GET().build();
        HttpResponse<String> auditRes = http.send(auditReq, HttpResponse.BodyHandlers.ofString());
        assertThat(auditRes.statusCode()).isBetween(200, 299);
        assertThat(auditRes.body()).contains("USER_CREATE");
    }
}
