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
public class PaymentWebhookDTO {
    private String event;          // "payment.captured" or "payment.succeeded"
    private UUID productId;
    private UUID buyerId;
    private Double amount;
    private String currency;       // "INR"
    private String paymentMethod;  // "CARD", "UPI", "NET_BANKING"
    private String cardLast4;      // e.g. "4242"
    private String transactionId;  // e.g. "TXN_MOCK_9876543210"
    private Long timestamp;
}
