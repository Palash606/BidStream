package com.bidstream.auctionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GavelEventDTO {
    private UUID productId;
    private int hitCount; // 0 = LIVE/RESET, 1 = GOING_ONCE, 2 = GOING_TWICE, 3 = SOLD
    private String stage; // "LIVE", "GOING_ONCE", "GOING_TWICE", "SOLD"
    private String message;
    private Double currentHighestBid;
    private String winnerMaskedName;
    private long timestamp;
}

