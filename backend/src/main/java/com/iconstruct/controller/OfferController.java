package com.iconstruct.controller;

import com.iconstruct.domain.RepairOffer;
import com.iconstruct.dto.offer.CreateOfferDto;
import com.iconstruct.security.CurrentUser;
import com.iconstruct.security.UserPrincipal;
import com.iconstruct.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/repair-requests/{requestId}/offers")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ResponseEntity<RepairOffer> createOffer(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long requestId,
            @Valid @RequestBody CreateOfferDto dto) {
        RepairOffer offer = offerService.createOffer(currentUser.getId(), requestId, dto);
        return ResponseEntity.ok(offer);
    }

    @GetMapping("/repair-requests/{requestId}/offers")
    public ResponseEntity<List<RepairOffer>> getOffersForRequest(@PathVariable Long requestId) {
        List<RepairOffer> offers = offerService.getOffersForRequest(requestId);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/offers/my-offers")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ResponseEntity<List<RepairOffer>> getMyOffers(@CurrentUser UserPrincipal currentUser) {
        List<RepairOffer> offers = offerService.getOffersForProfessional(currentUser.getId());
        return ResponseEntity.ok(offers);
    }

    @PostMapping("/offers/{offerId}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<RepairOffer> acceptOffer(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long offerId) {
        RepairOffer offer = offerService.acceptOffer(offerId, currentUser.getId());
        return ResponseEntity.ok(offer);
    }

    @PostMapping("/offers/{offerId}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<RepairOffer> rejectOffer(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long offerId) {
        RepairOffer offer = offerService.rejectOffer(offerId, currentUser.getId());
        return ResponseEntity.ok(offer);
    }
}
