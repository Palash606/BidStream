package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSettlementService {

    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StringRedisTemplate redisTemplate;

    @Value("${bidstream.payment.webhook-secret:bidstream-mock-secret-key-2026}")
    private String webhookSecret;

    public boolean verifyHmacSignature(String rawBody, String signature) {
        if (signature == null || rawBody == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.toLowerCase().getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to compute HMAC signature: {}", e.getMessage());
            return false;
        }
    }

    public String computeHmacSignature(String rawBody) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC signature", e);
        }
    }

    @Transactional
    public Product settlePayment(UUID productId, UUID buyerId, Double amount, String transactionId, String paymentMethod) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (product.getStatus() == ProductStatus.SOLD) {
            log.info("Product {} is already marked SOLD. Returning current record.", productId);
            return product;
        }

        Double expectedAmount = product.getCurrentHighestBid() != null ? product.getCurrentHighestBid() : product.getInitialPrice();
        if (amount != null && expectedAmount != null && Math.abs(amount - expectedAmount) > 0.01) {
            throw new IllegalArgumentException("Payment amount (₹" + amount + ") does not match winning bid (₹" + expectedAmount + ")");
        }

        product.setStatus(ProductStatus.SOLD);
        if (buyerId != null) {
            product.setWinnerId(buyerId);
        }
        product.setPaymentTransactionId(transactionId != null ? transactionId : ("TXN_MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()));
        product.setPaymentSettledAt(LocalDateTime.now());
        Product saved = productRepository.save(product);

        // Evict seller analytics cache in Redis so metrics immediately reflect the new sale
        if (saved.getSellerId() != null) {
            try {
                Set<String> keys = redisTemplate.keys(SellerAnalyticsService.CACHE_PREFIX + saved.getSellerId() + ":*");
                if (keys != null && !keys.isEmpty()) {
                    redisTemplate.delete(keys);
                    log.info("Evicted seller analytics cache for seller: {}", saved.getSellerId());
                }
            } catch (Exception e) {
                log.warn("Redis analytics cache eviction skipped: {}", e.getMessage());
            }
        }

        // Broadcast settlement over WebSocket topic: /topic/auction/{productId}
        try {
            messagingTemplate.convertAndSend("/topic/auction/" + productId, Map.of(
                    "type", "AUCTION_SETTLED",
                    "productId", productId,
                    "status", "SOLD",
                    "transactionId", saved.getPaymentTransactionId(),
                    "settledAt", saved.getPaymentSettledAt().toString()
            ));
        } catch (Exception e) {
            log.warn("Failed to broadcast auction settlement over WebSocket: {}", e.getMessage());
        }

        log.info("Auction lot {} successfully settled and transitioned to SOLD with transactionId {}", productId, saved.getPaymentTransactionId());
        return saved;
    }
}
