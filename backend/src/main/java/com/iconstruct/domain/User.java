package com.iconstruct.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType userType; // CLIENT, PROFESSIONAL

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    // For professionals only
    @Column(name = "company_name")
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    // Professional: categories they work in
    @ManyToMany
    @JoinTable(
        name = "user_categories",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    // Professional: zones they cover
    @ElementCollection
    @CollectionTable(name = "user_zones", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "zone")
    private Set<String> zones = new HashSet<>();

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "fcm_token")
    private String fcmToken; // Firebase Cloud Messaging token for push notifications

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
