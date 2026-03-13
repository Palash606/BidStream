package com.bidstream.identityservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seller_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String aadharNumber;
    private String gstNumber;
    private String passportNumber;
    
    // Store seller type: DOMESTIC or INTERNATIONAL
    private String sellerType;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime verifiedAt;

    @Builder.Default
    private boolean isApproved = false;
}
