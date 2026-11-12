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
public class MockCardPaymentRequest {
    private UUID productId;
    private UUID buyerId;
    private Double amount;
    private String cardNumber;
    private String cardExpiry;
    private String cvv;
    private String cardHolderName;
    private String otp;
}
