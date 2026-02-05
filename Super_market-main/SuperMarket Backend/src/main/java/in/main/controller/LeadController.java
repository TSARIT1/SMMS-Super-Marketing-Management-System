package in.main.controller;

import in.main.entities.Lead;
import in.main.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<Lead> createLead(@Valid @RequestBody Lead lead) {
        Lead saved = leadService.save(lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
