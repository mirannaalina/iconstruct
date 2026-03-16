package com.iconstruct.service;

import com.iconstruct.domain.*;
import com.iconstruct.dto.offer.CreateOfferDto;
import com.iconstruct.repository.OfferRepository;
import com.iconstruct.repository.RepairRequestRepository;
import com.iconstruct.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final RepairRequestRepository requestRepository;
    private final UserRepository userRepository;

    public OfferService(
            OfferRepository offerRepository,
            RepairRequestRepository requestRepository,
            UserRepository userRepository) {
        this.offerRepository = offerRepository;
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RepairOffer createOffer(Long professionalId, Long requestId, CreateOfferDto dto) {
        User professional = userRepository.findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));

        if (professional.getUserType() != UserType.PROFESSIONAL) {
            throw new RuntimeException("Only professionals can create offers");
        }

        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.ACTIVE) {
            throw new RuntimeException("Can only make offers on active requests");
        }

        if (offerRepository.existsByRequestIdAndProfessionalId(requestId, professionalId)) {
            throw new RuntimeException("You already submitted an offer for this request");
        }

        BigDecimal totalPrice = dto.getLaborPrice();
        if (dto.getPartsPrice() != null) {
            totalPrice = totalPrice.add(dto.getPartsPrice());
        }

        RepairOffer offer = RepairOffer.builder()
                .request(request)
                .professional(professional)
                .laborPrice(dto.getLaborPrice())
                .partsPrice(dto.getPartsPrice())
                .partsOption(dto.getPartsOption())
                .partsDescription(dto.getPartsDescription())
                .totalPrice(totalPrice)
                .estimatedDurationMinutes(dto.getEstimatedDurationMinutes())
                .notes(dto.getNotes())
                .status(OfferStatus.PENDING)
                .build();

        return offerRepository.save(offer);
    }

    public List<RepairOffer> getOffersForRequest(Long requestId) {
        return offerRepository.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    public List<RepairOffer> getOffersForProfessional(Long professionalId) {
        return offerRepository.findByProfessionalIdOrderByCreatedAtDesc(professionalId);
    }

    @Transactional
    public RepairOffer acceptOffer(Long offerId, Long clientId) {
        RepairOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        RepairRequest request = offer.getRequest();

        // Verify the client owns this request
        if (!request.getClient().getId().equals(clientId)) {
            throw new RuntimeException("You can only accept offers on your own requests");
        }

        if (request.getStatus() != RequestStatus.ACTIVE) {
            throw new RuntimeException("Request is no longer active");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Offer is no longer pending");
        }

        // Accept this offer
        offer.setStatus(OfferStatus.ACCEPTED);
        offerRepository.save(offer);

        // Reject all other pending offers
        List<RepairOffer> otherOffers = offerRepository.findByRequestIdAndStatus(
                request.getId(), OfferStatus.PENDING);
        for (RepairOffer other : otherOffers) {
            if (!other.getId().equals(offerId)) {
                other.setStatus(OfferStatus.REJECTED);
                offerRepository.save(other);
            }
        }

        // Update request status
        request.setStatus(RequestStatus.IN_PROGRESS);
        request.setAcceptedOffer(offer);
        requestRepository.save(request);

        return offer;
    }

    @Transactional
    public RepairOffer rejectOffer(Long offerId, Long clientId) {
        RepairOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        RepairRequest request = offer.getRequest();

        // Verify the client owns this request
        if (!request.getClient().getId().equals(clientId)) {
            throw new RuntimeException("You can only reject offers on your own requests");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Offer is no longer pending");
        }

        offer.setStatus(OfferStatus.REJECTED);
        return offerRepository.save(offer);
    }
}
