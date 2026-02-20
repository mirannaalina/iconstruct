package com.iconstruct.service;

import com.iconstruct.domain.*;
import com.iconstruct.dto.repair.CreateRepairRequestDto;
import com.iconstruct.repository.CategoryRepository;
import com.iconstruct.repository.RepairRequestRepository;
import com.iconstruct.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RepairRequestService {

    private final RepairRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;

    public RepairRequestService(
            RepairRequestRepository requestRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RepairRequest createRequest(Long clientId, CreateRepairRequestDto dto) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (client.getUserType() != UserType.CLIENT) {
            throw new RuntimeException("Only clients can create repair requests");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        RepairRequest request = RepairRequest.builder()
                .client(client)
                .category(category)
                .problemType(dto.getProblemType())
                .problemDescription(dto.getProblemDescription())
                .urgency(dto.getUrgency())
                .city(dto.getCity())
                .zone(dto.getZone())
                .exactAddress(dto.getExactAddress())
                .status(RequestStatus.ACTIVE)
                .scheduledDate(dto.getScheduledDate())
                .build();

        if (dto.getMediaUrls() != null) {
            request.setMediaUrls(dto.getMediaUrls());
        }

        request = requestRepository.save(request);

        // Notify eligible professionals
        notificationService.notifyEligibleProfessionals(request);

        return request;
    }

    public Page<RepairRequest> getClientRequests(Long clientId, Pageable pageable) {
        return requestRepository.findByClientIdOrderByCreatedAtDesc(clientId, pageable);
    }

    public List<RepairRequest> getActiveRequestsForProfessional(Long professionalId) {
        User professional = userRepository.findById(professionalId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get requests matching professional's categories and zones
        // For now, return all active requests (simplified)
        return requestRepository.findAll().stream()
                .filter(r -> r.getStatus() == RequestStatus.ACTIVE)
                .filter(r -> professional.getCategories().contains(r.getCategory()))
                .filter(r -> professional.getZones().contains(r.getZone()))
                .toList();
    }

    public RepairRequest getRequestById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    @Transactional
    public RepairRequest updateStatus(Long requestId, RequestStatus newStatus) {
        RepairRequest request = getRequestById(requestId);
        request.setStatus(newStatus);
        return requestRepository.save(request);
    }
}
