package com.bidstream.auctionservice.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String description;
    private Double initialPrice;
    private Double currentHighestBid;

    @ElementCollection
    private List<String> imageUrls;

    private Double weight;
    private String dimensions;
    private String manufacturer;

    @ManyToOne
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.DRAFT;

    private LocalDateTime auctionEndTime;
    private String auctionType; // THREE_HAMMER or END_TIME
    private UUID sellerId;
    private UUID winnerId;

    @JsonProperty("categoryName")
    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }

    // High-End Feature: Backend provides HexCode based on starting letter
    public String getUsernameColorHex() {
        if (name == null || name.isEmpty())
            return "#000000";
        char firstChar = name.toUpperCase().charAt(0);
        // Map characters to a professional color palette
        return switch (firstChar) {
            case 'A', 'B', 'C' -> "#FF5733"; // Sunset Orange
            case 'D', 'E', 'F' -> "#33FF57"; // Emerald Green
            case 'G', 'H', 'I' -> "#3357FF"; // Royal Blue
            case 'J', 'K', 'L' -> "#F333FF"; // Magenta
            case 'M', 'N', 'O' -> "#FF33A8"; // Pink
            case 'P', 'Q', 'R' -> "#33FFF6"; // Cyan
            case 'S', 'T', 'U' -> "#FFD433"; // Gold
            default -> "#8D33FF"; // Purple
        };
    }

    public String getMaskedWinnerName(String realName) {
        if (this.status != ProductStatus.SOLD && this.status != ProductStatus.PAYMENT_PENDING) {
            if (realName == null || realName.length() < 3)
                return "***";
            return realName.charAt(0) + "****" + realName.charAt(realName.length() - 1);
        }
        return realName; // Show full name only after sold
    }
}