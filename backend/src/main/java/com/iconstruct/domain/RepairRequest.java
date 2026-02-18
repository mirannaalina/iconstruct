package com.iconstruct.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "repair_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "problem_type", nullable = false)
    private String problemType; // Din lista predefinită sau "Altceva"

    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgency; // URGENT, NORMAL, SCHEDULED

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String zone; // Cartier/zonă

    // Adresa exactă - vizibilă doar după acceptare ofertă
    @Column(name = "exact_address")
    private String exactAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    // Photos/videos
    @ElementCollection
    @CollectionTable(name = "repair_request_media", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "media_url")
    private List<String> mediaUrls = new ArrayList<>();

    // The accepted offer (if any)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_offer_id")
    private RepairOffer acceptedOffer;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate; // For SCHEDULED urgency

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RequestStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
