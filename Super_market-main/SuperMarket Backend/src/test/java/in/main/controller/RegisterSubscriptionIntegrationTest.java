package in.main.controller;

import in.main.repository.SubscriptionRepository;
import in.main.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema.sql",
        "spring.jpa.defer-datasource-initialization=true",
        "subscription.trial.auto-enabled=true",
        "subscription.trial.days=3"
})
public class RegisterSubscriptionIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    private final com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();

    @BeforeEach
    public void setup() {
        this.mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
        try { subscriptionRepository.deleteAll(); } catch (Exception ignored) {}
        userRepository.deleteAll();
    }

    @Test
    public void testRegisterStartsFreeTrial() throws Exception {
        var payload = java.util.Map.of(
                "full_name", "Trial Tester",
                "email", "trial@test.com",
                "phone", "9991112222",
                "password", "pw",
                "shop_name", "Trial Shop",
                "shop_address", "HQ"
        );

        var res = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();

        String body = res.getResponse().getContentAsString();
        java.util.Map<?,?> map = om.readValue(body, java.util.Map.class);

        // Expect the response contains subscription (auto-enabled in properties)
        org.junit.jupiter.api.Assertions.assertTrue(map.containsKey("subscription"));
        var sub = (java.util.Map<?,?>) map.get("subscription");
        org.junit.jupiter.api.Assertions.assertEquals("FREE_TRIAL", String.valueOf(sub.get("planType")));
        org.junit.jupiter.api.Assertions.assertTrue(Boolean.valueOf(String.valueOf(sub.get("trialActive"))));

        // And repository contains the subscription
        org.junit.jupiter.api.Assertions.assertEquals(1L, subscriptionRepository.count());
    }
}
