package in.main.controller;

import in.main.entities.Ticket;
import in.main.entities.Ticket.TicketPriority;
import in.main.entities.Ticket.TicketStatus;
import in.main.entities.TicketMessage;
import in.main.entities.User;
import in.main.repository.TicketRepository;
import in.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private in.main.service.EmailService emailService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private in.main.repository.TicketMessageRepository ticketMessageRepository;

    @Autowired
    private in.main.repository.TicketAttachmentRepository ticketAttachmentRepository;

    @Autowired
    private in.main.service.FileStorageService fileStorageService;

    /**
     * Create a new ticket (User)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> ticketRequest) {
        try {
            Long userId = Long.parseLong(ticketRequest.get("userId").toString());
            String subject = ticketRequest.get("subject").toString();
            String description = ticketRequest.get("description").toString();
            String priorityStr = ticketRequest.getOrDefault("priority", "MEDIUM").toString();
            String category = ticketRequest.getOrDefault("category", "General").toString();

            // Validate user exists
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Create ticket
            Ticket ticket = new Ticket();
            ticket.setUserId(userId);
            ticket.setSubject(subject);
            ticket.setDescription(description);
            ticket.setPriority(TicketPriority.valueOf(priorityStr.toUpperCase()));
            ticket.setCategory(category);
            ticket.setStatus(TicketStatus.OPEN);

            Ticket savedTicket = ticketRepository.save(ticket);

            // Generate a friendly ticket number (TKT-000001) and save
            String ticketNumber = String.format("TKT-%06d", savedTicket.getId());
            savedTicket.setTicketNumber(ticketNumber);

            // Save again to persist ticket number
            ticketRepository.save(savedTicket);

                    // Persist initial user message to ticket messages
            try {
                TicketMessage msg = new TicketMessage(savedTicket, TicketMessage.Sender.USER, userId, description);
                ticketMessageRepository.save(msg);
            } catch (Exception e) {
                System.err.println("Failed to save initial ticket message: " + e.getMessage());
            }
            // Send ticket created email notification
            try {
                User user = userOptional.get();
                emailService.sendTicketCreatedEmail(
                    user.getEmail(),
                    user.getFullName(),
                    savedTicket.getId(),
                    savedTicket.getSubject(),
                    savedTicket.getDescription(),
                    savedTicket.getPriority().name(),
                    savedTicket.getCategory()
                );
            } catch (Exception e) {
                // Log error but don't fail ticket creation if email fails
                System.err.println("Failed to send ticket created email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Ticket created successfully",
                    "ticketId", savedTicket.getId(),
                    "ticketNumber", ticketNumber,
                    "status", savedTicket.getStatus().name()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create ticket: " + e.getMessage()));
        }
    }

    /**
     * Get all tickets for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTickets(@PathVariable Long userId) {
        try {
            // Use native query to avoid any JPA caching anomalies
            java.util.List<Long> ids = jdbcTemplate.queryForList(
                    "SELECT id FROM tickets WHERE user_id = ? AND deleted = FALSE ORDER BY created_at DESC",
                    Long.class,
                    userId
            );

            List<Ticket> tickets = ids.stream()
                    .map(id -> ticketRepository.findById(id).orElse(null))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            List<Map<String, Object>> ticketList = tickets.stream().map(ticket -> {
                Map<String, Object> ticketMap = new HashMap<>();
                ticketMap.put("id", ticket.getId());
                ticketMap.put("ticketNumber", ticket.getTicketNumber());
                ticketMap.put("subject", ticket.getSubject());
                ticketMap.put("description", ticket.getDescription());
                ticketMap.put("status", ticket.getStatus().name());
                ticketMap.put("priority", ticket.getPriority().name());
                ticketMap.put("category", ticket.getCategory());
                ticketMap.put("adminResponse", ticket.getAdminResponse());
                ticketMap.put("createdAt", ticket.getCreatedAt().toString());
                ticketMap.put("updatedAt", ticket.getUpdatedAt().toString());
                ticketMap.put("resolvedAt", ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : null);

                // Load messages
                try {
                    List<TicketMessage> messages = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
                    List<Map<String,Object>> msgs = messages.stream().map(m -> {
                        Map<String,Object> mm = new HashMap<>();
                        mm.put("sender", m.getSender().name());
                        mm.put("senderId", m.getSenderId());
                        mm.put("message", m.getMessage());
                        mm.put("createdAt", m.getCreatedAt().toString());
                        return mm;
                    }).collect(Collectors.toList());
                    ticketMap.put("messages", msgs);
                } catch (Exception e) {
                    ticketMap.put("messages", java.util.Collections.emptyList());
                }

                return ticketMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ticketList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tickets: " + e.getMessage()));
        }
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable Long ticketId) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            Map<String, Object> ticketMap = new HashMap<>();
            ticketMap.put("id", ticket.getId());
            ticketMap.put("ticketNumber", ticket.getTicketNumber());
            ticketMap.put("userId", ticket.getUserId());
            ticketMap.put("subject", ticket.getSubject());
            ticketMap.put("description", ticket.getDescription());
            ticketMap.put("status", ticket.getStatus().name());
            ticketMap.put("priority", ticket.getPriority().name());
            ticketMap.put("category", ticket.getCategory());
            ticketMap.put("adminResponse", ticket.getAdminResponse());
            ticketMap.put("createdAt", ticket.getCreatedAt().toString());
            ticketMap.put("resolvedAt", ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : null);

            // Load messages + any attachments
            try {
                List<TicketMessage> messages = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
                List<Map<String,Object>> msgs = messages.stream().map(m -> {
                    Map<String,Object> mm = new HashMap<>();
                    mm.put("id", m.getId());
                    mm.put("sender", m.getSender().name());
                    mm.put("senderId", m.getSenderId());
                    mm.put("message", m.getMessage());
                    mm.put("createdAt", m.getCreatedAt().toString());
                    // attachments
                    try {
                        List<Map<String,Object>> atts = m.getAttachments().stream().map(a -> {
                            Map<String,Object> am = new HashMap<>();
                            am.put("id", a.getId());
                            am.put("originalName", a.getOriginalName());
                            am.put("downloadUrl", "/api/tickets/attachments/" + a.getId());
                            return am;
                        }).collect(Collectors.toList());
                        mm.put("attachments", atts);
                    } catch (Exception ex) {
                        mm.put("attachments", java.util.Collections.emptyList());
                    }
                    return mm;
                }).collect(Collectors.toList());
                ticketMap.put("messages", msgs);
            } catch (Exception e) {
                ticketMap.put("messages", java.util.Collections.emptyList());
            }

            return ResponseEntity.ok(ticketMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch ticket: " + e.getMessage()));
        }
    }

    @GetMapping("/attachments/{id}")
    public ResponseEntity<?> downloadAttachment(@PathVariable Long id) {
        try {
            Optional<in.main.entities.TicketAttachment> opt = ticketAttachmentRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Attachment not found"));
            in.main.entities.TicketAttachment att = opt.get();
            // Authorization: only admin or ticket owner can download
            Long ticketOwner = null;
            try {
                if (att.getMessage() != null && att.getMessage().getTicket() != null) {
                    ticketOwner = att.getMessage().getTicket().getUserId();
                }
            } catch (Exception ex) { /* ignore */ }

            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean allowed = false;
            if (authentication != null && authentication.getAuthorities() != null) {
                allowed = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            }
            if (!allowed && authentication != null && authentication.getPrincipal() != null) {
                Object p = authentication.getPrincipal();
                try {
                    Long pid = (p instanceof Long) ? (Long) p : Long.parseLong(p.toString());
                    if (ticketOwner != null && pid.equals(ticketOwner)) allowed = true;
                } catch (Exception ex) { /* ignore */ }
            }
            if (!allowed) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
            }

            org.springframework.core.io.Resource res = fileStorageService.loadAsResource(att.getStoredName());
            if (res == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found"));
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + att.getOriginalName().replaceAll("\"","") + "\"")
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, att.getContentType() != null ? att.getContentType() : "application/octet-stream")
                    .body(res);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch attachment: " + e.getMessage()));
        }
    }

    /**
     * Get all tickets (Admin only)
     */

    /**
     * Create ticket (multipart with optional attachments)
     */
    @PostMapping(value = "/create-multipart", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createTicketMultipart(
            @RequestParam Long userId,
            @RequestParam String subject,
            @RequestParam String description,
            @RequestParam(required = false, defaultValue = "MEDIUM") String priority,
            @RequestParam(required = false, defaultValue = "General") String category,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile[] attachments
    ) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            Ticket ticket = new Ticket();
            ticket.setUserId(userId);
            ticket.setSubject(subject);
            ticket.setDescription(description);
            ticket.setPriority(TicketPriority.valueOf(priority.toUpperCase()));
            ticket.setCategory(category);
            ticket.setStatus(TicketStatus.OPEN);

            Ticket savedTicket = ticketRepository.save(ticket);
            String ticketNumber = String.format("TKT-%06d", savedTicket.getId());
            savedTicket.setTicketNumber(ticketNumber);
            ticketRepository.save(savedTicket);

            // Save initial message
            TicketMessage msg = new TicketMessage(savedTicket, TicketMessage.Sender.USER, userId, description);
            ticketMessageRepository.save(msg);

            // Save attachments if provided
            if (attachments != null && attachments.length > 0) {
                for (org.springframework.web.multipart.MultipartFile f : attachments) {
                    try {
                        String stored = fileStorageService.saveForTicket(f, savedTicket.getId());
                        in.main.entities.TicketAttachment att = new in.main.entities.TicketAttachment(msg, f.getOriginalFilename(), stored, f.getContentType(), f.getSize());
                        ticketAttachmentRepository.save(att);
                        msg.addAttachment(att);
                    } catch (Exception ex) {
                        System.err.println("Failed to store attachment: " + ex.getMessage());
                    }
                }
                ticketMessageRepository.save(msg);
            }

            // Send email notification (best effort)
            try {
                User user = userOptional.get();
                emailService.sendTicketCreatedEmail(
                        user.getEmail(),
                        user.getFullName(),
                        savedTicket.getId(),
                        savedTicket.getSubject(),
                        savedTicket.getDescription(),
                        savedTicket.getPriority().name(),
                        savedTicket.getCategory()
                );
            } catch (Exception e) {
                System.err.println("Failed to send ticket created email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of("message", "Ticket created successfully", "ticketId", savedTicket.getId(), "ticketNumber", ticketNumber));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create ticket: " + e.getMessage()));
        }
    }

    /**
     * Get all tickets (Admin only)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<Ticket> tickets = ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc();
            
            List<Map<String, Object>> ticketList = tickets.stream().map(ticket -> {
                Map<String, Object> ticketMap = new HashMap<>();
                ticketMap.put("id", ticket.getId());
                ticketMap.put("ticketNumber", ticket.getTicketNumber());
                ticketMap.put("userId", ticket.getUserId());
                ticketMap.put("subject", ticket.getSubject());
                ticketMap.put("description", ticket.getDescription());
                ticketMap.put("status", ticket.getStatus().name());
                ticketMap.put("priority", ticket.getPriority().name());
                ticketMap.put("category", ticket.getCategory());
                ticketMap.put("adminResponse", ticket.getAdminResponse());
                ticketMap.put("createdAt", ticket.getCreatedAt().toString());
                ticketMap.put("resolvedAt", ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : null);
                
                // Load messages count and last message preview
                try {
                    List<TicketMessage> messages = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
                    ticketMap.put("messageCount", messages.size());
                    if (!messages.isEmpty()) {
                        TicketMessage last = messages.get(messages.size() - 1);
                        Map<String,Object> lm = new HashMap<>();
                        lm.put("sender", last.getSender().name());
                        lm.put("message", last.getMessage());
                        lm.put("createdAt", last.getCreatedAt());
                        ticketMap.put("lastMessage", lm);
                    }
                } catch (Exception e) {
                    ticketMap.put("messageCount", 0);
                }
                
                // Get user details
                Optional<User> user = userRepository.findById(ticket.getUserId());
                if (user.isPresent()) {
                    ticketMap.put("userName", user.get().getFullName());
                    ticketMap.put("userEmail", user.get().getEmail());
                }
                
                return ticketMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ticketList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tickets: " + e.getMessage()));
        }
    }

    /**
     * Update ticket status (Admin)
     */
    @PutMapping("/admin/{ticketId}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            String statusStr = request.get("status").toString();
            TicketStatus newStatus = TicketStatus.valueOf(statusStr.toUpperCase());
            
            ticket.setStatus(newStatus);
            
            // If resolving or closing, set resolved timestamp
            if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
                ticket.setResolvedAt(LocalDateTime.now());
                if (request.containsKey("resolvedBy")) {
                    ticket.setResolvedBy(Long.parseLong(request.get("resolvedBy").toString()));
                }
                
                // Send ticket resolved email notification
                try {
                    Optional<User> userOptional = userRepository.findById(ticket.getUserId());
                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        String resolution = ticket.getAdminResponse() != null ? ticket.getAdminResponse() : "Your issue has been resolved.";
                        emailService.sendTicketResolvedEmail(
                            user.getEmail(),
                            user.getFullName(),
                            ticket.getId(),
                            ticket.getSubject(),
                            resolution
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send ticket resolved email: " + e.getMessage());
                }
            }
            
            ticketRepository.save(ticket);

            return ResponseEntity.ok(Map.of(
                    "message", "Ticket status updated successfully",
                    "status", newStatus.name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update ticket status: " + e.getMessage()));
        }
    }

    /**
     * Add admin response to ticket
     */
    @PutMapping("/admin/{ticketId}/respond")
    public ResponseEntity<?> respondToTicket(
            @PathVariable Long ticketId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            String response = request.get("response").toString();
            
            // Add admin message
            TicketMessage msg = new TicketMessage(ticket, TicketMessage.Sender.ADMIN, null, response);
            ticketMessageRepository.save(msg);

            ticket.setAdminResponse(response);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            
            if (request.containsKey("resolvedBy")) {
                ticket.setResolvedBy(Long.parseLong(request.get("resolvedBy").toString()));
            }
            
            ticketRepository.save(ticket);
            
            // Send admin response email notification
            try {
                Optional<User> userOptional = userRepository.findById(ticket.getUserId());
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    emailService.sendTicketResponseEmail(
                        user.getEmail(),
                        user.getFullName(),
                        ticket.getId(),
                        ticket.getSubject(),
                        response,
                        ticket.getStatus().name()
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send ticket response email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Response added successfully",
                    "status", ticket.getStatus().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to respond to ticket: " + e.getMessage()));
        }
    }

    /**
     * Admin respond (multipart, optional attachments)
     */
    @PutMapping(value = "/admin/{ticketId}/respond-multipart", consumes = {"multipart/form-data"})
    public ResponseEntity<?> respondToTicketMultipart(
            @PathVariable Long ticketId,
            @RequestParam String response,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile[] attachments,
            @RequestParam(required = false) Long resolvedBy
    ) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();

            TicketMessage msg = new TicketMessage(ticket, TicketMessage.Sender.ADMIN, resolvedBy, response);
            ticketMessageRepository.save(msg);

            // Save attachments
            if (attachments != null && attachments.length > 0) {
                for (org.springframework.web.multipart.MultipartFile f : attachments) {
                    try {
                        String stored = fileStorageService.saveForTicket(f, ticket.getId());
                        in.main.entities.TicketAttachment att = new in.main.entities.TicketAttachment(msg, f.getOriginalFilename(), stored, f.getContentType(), f.getSize());
                        ticketAttachmentRepository.save(att);
                        msg.addAttachment(att);
                    } catch (Exception ex) {
                        System.err.println("Failed to store admin attachment: " + ex.getMessage());
                    }
                }
                ticketMessageRepository.save(msg);
            }

            ticket.setAdminResponse(response);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            if (resolvedBy != null) ticket.setResolvedBy(resolvedBy);
            ticketRepository.save(ticket);

            // notify user
            try {
                Optional<User> userOptional = userRepository.findById(ticket.getUserId());
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    emailService.sendTicketResponseEmail(user.getEmail(), user.getFullName(), ticket.getId(), ticket.getSubject(), response, ticket.getStatus().name());
                }
            } catch (Exception e) {
                System.err.println("Failed to send ticket response email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of("message", "Response added successfully", "status", ticket.getStatus().name()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to respond to ticket: " + e.getMessage()));
        }
    }

    /**
     * Add admin reply to ticket (Alternative endpoint with query params)
     */
    @PutMapping("/{ticketId}/reply")
    public ResponseEntity<?> replyToTicket(
            @PathVariable Long ticketId,
            @RequestParam String adminResponse,
            @RequestParam(required = false) Long adminId) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            // Add admin message and resolve
            TicketMessage msg = new TicketMessage(ticket, TicketMessage.Sender.ADMIN, adminId, adminResponse);
            ticketMessageRepository.save(msg);

            ticket.setAdminResponse(adminResponse);
            ticket.setStatus(TicketStatus.RESOLVED);
            ticket.setResolvedAt(LocalDateTime.now());
            
            if (adminId != null) {
                ticket.setResolvedBy(adminId);
            }
            
            ticketRepository.save(ticket);
            
            // Send ticket resolved email notification
            try {
                Optional<User> userOptional = userRepository.findById(ticket.getUserId());
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    emailService.sendTicketResolvedEmail(
                        user.getEmail(),
                        user.getFullName(),
                        ticket.getId(),
                        ticket.getSubject(),
                        adminResponse
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send ticket resolved email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Reply sent successfully",
                    "status", ticket.getStatus().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send reply: " + e.getMessage()));
        }
    }

    /**
     * User adds a follow-up reply to an existing ticket (JSON)
     */
    @PostMapping("/{ticketId}/reply")
    public ResponseEntity<?> userReplyToTicket(
            @PathVariable Long ticketId,
            @RequestBody Map<String, Object> body) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            String message = body.get("message") != null ? body.get("message").toString() : "";
            Long userId = body.get("userId") != null ? Long.parseLong(body.get("userId").toString()) : null;
            if (message.isBlank() || userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId and message required"));
            }

            TicketMessage msg = new TicketMessage(ticket, TicketMessage.Sender.USER, userId, message);
            ticketMessageRepository.save(msg);

            // If ticket was resolved or closed, move it back to IN_PROGRESS
            if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
            }
            ticketRepository.save(ticket);

            return ResponseEntity.ok(Map.of("message", "Reply added", "status", ticket.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add reply: " + e.getMessage()));
        }
    }

    /**
     * User adds a follow-up reply to an existing ticket (multipart, with attachments)
     */
    @PostMapping(value = "/{ticketId}/reply-multipart", consumes = {"multipart/form-data"})
    public ResponseEntity<?> userReplyToTicketMultipart(
            @PathVariable Long ticketId,
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile[] attachments
    ) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            TicketMessage msg = new TicketMessage(ticket, TicketMessage.Sender.USER, userId, message);
            ticketMessageRepository.save(msg);

            if (attachments != null && attachments.length > 0) {
                for (org.springframework.web.multipart.MultipartFile f : attachments) {
                    try {
                        String stored = fileStorageService.saveForTicket(f, ticket.getId());
                        in.main.entities.TicketAttachment att = new in.main.entities.TicketAttachment(msg, f.getOriginalFilename(), stored, f.getContentType(), f.getSize());
                        ticketAttachmentRepository.save(att);
                        msg.addAttachment(att);
                    } catch (Exception ex) {
                        System.err.println("Failed to store user attachment: " + ex.getMessage());
                    }
                }
                ticketMessageRepository.save(msg);
            }

            // If ticket was resolved or closed, move it back to IN_PROGRESS
            if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
            }
            ticketRepository.save(ticket);

            return ResponseEntity.ok(Map.of("message", "Reply added", "status", ticket.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to add reply: " + e.getMessage()));
        }
    }

    /**
     * Get ticket statistics (Admin)
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getTicketStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTickets", ticketRepository.findAllByDeletedFalseOrderByCreatedAtDesc().size());
            stats.put("openTickets", ticketRepository.countByStatusAndDeletedFalse(TicketStatus.OPEN));
            stats.put("inProgressTickets", ticketRepository.countByStatusAndDeletedFalse(TicketStatus.IN_PROGRESS));
            stats.put("resolvedTickets", ticketRepository.countByStatusAndDeletedFalse(TicketStatus.RESOLVED));
            stats.put("closedTickets", ticketRepository.countByStatusAndDeletedFalse(TicketStatus.CLOSED));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch ticket statistics: " + e.getMessage()));
        }
    }

    /**
     * Delete ticket (Admin)
     */
    @DeleteMapping("/admin/{ticketId}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long ticketId) {
        try {
            Optional<Ticket> ticketOptional = ticketRepository.findById(ticketId);
            if (ticketOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            Ticket ticket = ticketOptional.get();
            // Only allow deletion if ticket resolved or closed
            if (ticket.getStatus() != Ticket.TicketStatus.RESOLVED && ticket.getStatus() != Ticket.TicketStatus.CLOSED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Only resolved or closed tickets can be deleted"));
            }

            ticket.setDeleted(true);
            ticket.setDeletedAt(LocalDateTime.now());
            ticketRepository.save(ticket);
            ticketRepository.flush();

            return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete ticket: " + e.getMessage()));
        }
    }
}
