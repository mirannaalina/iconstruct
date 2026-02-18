package com.iconstruct.repository;

import com.iconstruct.domain.RepairRequest;
import com.iconstruct.domain.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {

    Page<RepairRequest> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);

    List<RepairRequest> findByClientIdAndStatus(Long clientId, RequestStatus status);

    @Query("SELECT r FROM RepairRequest r " +
           "WHERE r.category.id = :categoryId " +
           "AND r.zone = :zone " +
           "AND r.status = 'ACTIVE'")
    List<RepairRequest> findActiveRequestsForProfessional(
        @Param("categoryId") Long categoryId,
        @Param("zone") String zone
    );

    @Query("SELECT r FROM RepairRequest r " +
           "JOIN RepairOffer o ON o.request = r " +
           "WHERE o.professional.id = :professionalId " +
           "ORDER BY r.createdAt DESC")
    Page<RepairRequest> findRequestsWithOffersByProfessional(
        @Param("professionalId") Long professionalId,
        Pageable pageable
    );
}
