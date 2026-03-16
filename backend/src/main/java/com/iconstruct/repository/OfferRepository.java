package com.iconstruct.repository;

import com.iconstruct.domain.RepairOffer;
import com.iconstruct.domain.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<RepairOffer, Long> {

    List<RepairOffer> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    List<RepairOffer> findByProfessionalIdOrderByCreatedAtDesc(Long professionalId);

    boolean existsByRequestIdAndProfessionalId(Long requestId, Long professionalId);

    List<RepairOffer> findByRequestIdAndStatus(Long requestId, OfferStatus status);
}
