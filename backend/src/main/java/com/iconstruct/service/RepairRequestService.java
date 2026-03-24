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
                .urgency(dto.getUrgencyLevel())
                .city(dto.getCity())
                .zone(dto.getZone())
                .exactAddress(dto.getAddress())
                .status(RequestStatus.ACTIVE)
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
        // For now, show all active requests to all professionals
        // TODO: Add filtering by categories/zones when profile management is implemented
        return requestRepository.findAll().stream()
                .filter(r -> r.getStatus() == RequestStatus.ACTIVE)
                .toList();
    }

    public List<RepairRequest> getMyJobsForProfessional(Long professionalId) {
        // Get requests where this professional's offer was accepted
        return requestRepository.findAll().stream()
                .filter(r -> r.getAcceptedOffer() != null)
                .filter(r -> r.getAcceptedOffer().getProfessional().getId().equals(professionalId))
                .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS || r.getStatus() == RequestStatus.COMPLETED)
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
