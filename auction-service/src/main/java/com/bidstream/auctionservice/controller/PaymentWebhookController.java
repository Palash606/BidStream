package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.dto.MockCardPaymentRequest;
import com.bidstream.auctionservice.dto.PaymentWebhookDTO;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.service.PaymentSettlementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final PaymentSettlementService settlementService;
    private final ObjectMapper objectMapper;

    /**
     * Gateway Webhook endpoint (Razorpay/Stripe HMAC-SHA256 signature verification)
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handlePaymentWebhook(
            @RequestHeader(value = "X-Payment-Signature", required = false) String signature,
            @RequestBody String rawPayload
    ) {
        log.info("Received payment webhook with signature: {}", signature);

        if (signature == null || !settlementService.verifyHmacSignature(rawPayload, signature)) {
            log.warn("Rejected webhook: Invalid or missing HMAC-SHA256 signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or missing HMAC signature"));
        }

        try {
            PaymentWebhookDTO dto = objectMapper.readValue(rawPayload, PaymentWebhookDTO.class);
            Product settled = settlementService.settlePayment(
                    dto.getProductId(),
                    dto.getBuyerId(),
                    dto.getAmount(),
                    dto.getTransactionId(),
                    dto.getPaymentMethod()
            );

            return ResponseEntity.ok(Map.of(
                    "status", "SETTLED",
                    "productId", settled.getId(),
                    "transactionId", settled.getPaymentTransactionId(),
                    "settledAt", settled.getPaymentSettledAt().toString()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Payment validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Payment webhook processing failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Webhook processing failed: " + e.getMessage()));
        }
    }

    /**
     * In-App Mock Credit/Debit Card Checkout Simulation endpoint
     */
    @PostMapping("/mock-charge")
    public ResponseEntity<?> processMockCardPayment(@RequestBody MockCardPaymentRequest request) {
        log.info("Processing mock card checkout for product: {} amount: ₹{}", request.getProductId(), request.getAmount());

        if (request.getProductId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ProductId is required"));
        }
        if (request.getCardNumber() == null || request.getCardNumber().replaceAll("\\s+", "").length() < 12) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid 16-digit card number"));
        }
        if (request.getCvv() == null || request.getCvv().length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid 3-digit CVV"));
        }

        // Simulate 3DS OTP verification
        if (request.getOtp() != null && !request.getOtp().isBlank() && !"123456".equals(request.getOtp().trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid 3DS OTP code. Use test code 123456."));
        }

        try {
            String txnId = "TXN_MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Product settled = settlementService.settlePayment(
                    request.getProductId(),
                    request.getBuyerId(),
                    request.getAmount(),
                    txnId,
                    "CARD"
            );

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "productId", settled.getId(),
                    "productName", settled.getName() != null ? settled.getName() : "Auction Lot",
                    "transactionId", settled.getPaymentTransactionId(),
                    "amount", request.getAmount(),
                    "currency", "INR",
                    "settledAt", settled.getPaymentSettledAt().toString(),
                    "message", "Payment settled successfully! Your lot is confirmed."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
