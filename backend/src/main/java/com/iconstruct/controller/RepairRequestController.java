package com.iconstruct.controller;

import com.iconstruct.domain.RepairRequest;
import com.iconstruct.dto.repair.CreateRepairRequestDto;
import com.iconstruct.security.CurrentUser;
import com.iconstruct.security.UserPrincipal;
import com.iconstruct.service.RepairRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repair-requests")
public class RepairRequestController {

    private final RepairRequestService requestService;

    public RepairRequestController(RepairRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<RepairRequest> createRequest(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateRepairRequestDto dto) {
        RepairRequest request = requestService.createRequest(currentUser.getId(), dto);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Page<RepairRequest>> getMyRequests(
            @CurrentUser UserPrincipal currentUser,
            Pageable pageable) {
        Page<RepairRequest> requests = requestService.getClientRequests(currentUser.getId(), pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ResponseEntity<List<RepairRequest>> getAvailableRequests(
            @CurrentUser UserPrincipal currentUser) {
        List<RepairRequest> requests = requestService.getActiveRequestsForProfessional(currentUser.getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairRequest> getRequestById(@PathVariable Long id) {
        RepairRequest request = requestService.getRequestById(id);
        return ResponseEntity.ok(request);
    }
}
