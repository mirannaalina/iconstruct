package com.iconstruct.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_offers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RepairOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private RepairRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private User professional;

    @Enumerated(EnumType.STRING)
    @Column(name = "parts_option", nullable = false)
    private PartsOption partsOption;
    // PROFESSIONAL_BRINGS - Vine cu piesa (recomandată)
    // PLATFORM_PROVIDES  - Platforma furnizează piesa
    // CLIENT_HAS         - Clientul are piesa

    // For PROFESSIONAL_BRINGS option
    @Column(name = "parts_description")
    private String partsDescription; // Descriere piesă (din listă sau generic)

    @Column(name = "parts_price", precision = 10, scale = 2)
    private BigDecimal partsPrice;

    @Column(name = "labor_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal laborPrice; // Preț manoperă

    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "arrival_time")
    private String arrivalTime; // ex: "În 30 minute", "Astăzi 14:00-16:00"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    // Price adjustment (if parts are different)
    @Column(name = "adjusted_price", precision = 10, scale = 2)
    private BigDecimal adjustedPrice;

    @Column(name = "adjustment_reason")
    private String adjustmentReason;

    @Column(name = "adjustment_accepted")
    private Boolean adjustmentAccepted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = OfferStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
