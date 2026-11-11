package com.bidstream.auctionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bid", indexes = {
        @Index(name = "idx_bid_product_amount", columnList = "product_id, amount DESC"),
        @Index(name = "idx_bid_bidder_id", columnList = "bidder_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UUID productId;
    private UUID bidderId;
    private String bidderName; // Masked name for history

    private Double amount;

    @CreationTimestamp
    private LocalDateTime bidTime;
}