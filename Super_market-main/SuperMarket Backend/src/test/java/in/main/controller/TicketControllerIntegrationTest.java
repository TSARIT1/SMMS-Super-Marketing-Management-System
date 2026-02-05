package in.main.controller;

import in.main.entities.User;
import in.main.repository.UserRepository;
import org.springframework.mock.web.MockMultipartFile;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.context.WebApplicationContext;
import org.junit.jupiter.api.BeforeEach;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema.sql",
        "spring.jpa.defer-datasource-initialization=true"
})
public class TicketControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();

    @BeforeEach
    public void setup() {
        this.mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
    }

    @Autowired
    private UserRepository userRepository;


    @Test
    public void testTicketLifecycle() throws Exception {
        // Create a user
        User user = new User("QA Tester", "qa@test.com", "9990001111", "pw", "QA Shop", "HQ");
        userRepository.save(user);

        // Create ticket
        Map<String, Object> createReq = Map.of(
                "userId", user.getId(),
                "subject", "Integration test ticket",
                "description", "This is a test",
                "priority", "MEDIUM",
                "category", "Technical"
        );

        org.springframework.test.web.servlet.MvcResult createResult = mockMvc.perform(post("/api/tickets/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(createReq)))
                .andReturn();
        System.out.println("CREATE STATUS: " + createResult.getResponse().getStatus());
        System.out.println("CREATE BODY: " + createResult.getResponse().getContentAsString());
        String createResp = createResult.getResponse().getContentAsString();
        Map<String, Object> createMap = om.readValue(createResp, Map.class);
        org.assertj.core.api.Assertions.assertThat(createResult.getResponse().getStatus()).isEqualTo(200);
        Integer ticketIdInt = (Integer) createMap.get("ticketId");
        Long ticketId = ticketIdInt.longValue();

        // User tickets should contain the ticket
        mockMvc.perform(get("/api/tickets/user/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Integration test ticket"));

        // Create a second user and a multipart ticket with an attachment (optional test for attachments)
        User user2 = new User("QA Tester 2", "qa2@test.com", "9990002222", "pw", "QA Shop 2", "HQ");
        userRepository.save(user2);

        MockMultipartFile file = new MockMultipartFile("attachments", "test.txt", "text/plain", "hello world".getBytes());
        mockMvc.perform(multipart("/api/tickets/create-multipart")
                        .file(file)
                        .param("userId", String.valueOf(user2.getId()))
                        .param("subject", "Integration multipart ticket")
                        .param("description", "This is a test with file")
                        .param("priority", "MEDIUM")
                        .param("category", "Technical"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketNumber").exists());

        // Admin respond
        Map<String, Object> respReq = Map.of("response", "We are looking into it");
        org.springframework.test.web.servlet.MvcResult respResult = mockMvc.perform(put("/api/tickets/admin/" + ticketId + "/respond")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(respReq)))
                .andReturn();
        System.out.println("RESP STATUS: " + respResult.getResponse().getStatus());
        System.out.println("RESP BODY: " + respResult.getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(respResult.getResponse().getStatus()).isEqualTo(200);
        org.assertj.core.api.Assertions.assertThat(respResult.getResponse().getContentAsString()).contains("Response added successfully");

        // Fetch the ticket and ensure message preserved
        org.springframework.test.web.servlet.MvcResult ticketResult = mockMvc.perform(get("/api/tickets/" + ticketId))
                .andReturn();
        System.out.println("TICKET GET STATUS: " + ticketResult.getResponse().getStatus());
        System.out.println("TICKET GET BODY: " + ticketResult.getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(ticketResult.getResponse().getStatus()).isEqualTo(200);
        String ticketResp = ticketResult.getResponse().getContentAsString();
        Map<String,Object> ticketMap = om.readValue(ticketResp, Map.class);
        java.util.List<Map<String,Object>> messages = (java.util.List<Map<String,Object>>) ticketMap.get("messages");
        assertThat(messages.size()).isGreaterThanOrEqualTo(1);

        // Update status to RESOLVED
        Map<String, Object> statusReq = Map.of("status", "RESOLVED");
        mockMvc.perform(put("/api/tickets/admin/" + ticketId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        // Delete ticket
        org.springframework.test.web.servlet.MvcResult delResult = mockMvc.perform(delete("/api/tickets/admin/" + ticketId))
                .andReturn();
        System.out.println("DELETE STATUS: " + delResult.getResponse().getStatus());
        System.out.println("DELETE BODY: " + delResult.getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(delResult.getResponse().getStatus()).isEqualTo(200);
        org.assertj.core.api.Assertions.assertThat(delResult.getResponse().getContentAsString()).contains("Ticket deleted successfully");

        // Ensure user tickets empty
        String listResp = mockMvc.perform(get("/api/tickets/user/" + user.getId()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Object[] tickets = om.readValue(listResp, Object[].class);
        assertThat(tickets.length).isEqualTo(0);
    }
}
