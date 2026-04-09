package com.bidstream.auctionservice.dto;

import com.bidstream.auctionservice.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private Double initialPrice;
    private Double currentHighestBid;
    private List<String> imageUrls;
    private Double weight;
    private String dimensions;
    private String manufacturer;
    private String categoryName;
    private ProductStatus status;
    private String auctionType;
    private LocalDateTime auctionEndTime;
    private LocalDateTime addedDate;
    private UUID sellerId;
    private UUID winnerId;
    private String usernameColorHex;
}
