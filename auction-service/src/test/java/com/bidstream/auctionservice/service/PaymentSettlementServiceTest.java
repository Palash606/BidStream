package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentSettlementServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private StringRedisTemplate redisTemplate;

    private PaymentSettlementService settlementService;

    @BeforeEach
    void setUp() {
        settlementService = new PaymentSettlementService(productRepository, messagingTemplate, redisTemplate);
        ReflectionTestUtils.setField(settlementService, "webhookSecret", "test-secret-key-123");
    }

    @Test
    void testHmacSignatureVerification_MatchesValidHash() {
        String payload = "{\"productId\":\"12345\",\"amount\":5000}";
        String signature = settlementService.computeHmacSignature(payload);

        assertNotNull(signature);
        assertTrue(settlementService.verifyHmacSignature(payload, signature));
        assertFalse(settlementService.verifyHmacSignature(payload, "invalid-signature"));
    }

    @Test
    void testSettlePayment_TransitionsToSoldAndBroadcasts() {
        UUID productId = UUID.randomUUID();
        UUID buyerId = UUID.randomUUID();
        UUID sellerId = UUID.randomUUID();

        Product product = Product.builder()
                .id(productId)
                .sellerId(sellerId)
                .name("Antique Clock")
                .status(ProductStatus.PAYMENT_PENDING)
                .currentHighestBid(15000.0)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product settled = settlementService.settlePayment(productId, buyerId, 15000.0, "TXN_TEST_123", "CARD");

        assertNotNull(settled);
        assertEquals(ProductStatus.SOLD, settled.getStatus());
        assertEquals("TXN_TEST_123", settled.getPaymentTransactionId());
        assertEquals(buyerId, settled.getWinnerId());
        assertNotNull(settled.getPaymentSettledAt());

        verify(messagingTemplate).convertAndSend(eq("/topic/auction/" + productId), anyMap());
    }

    @Test
    void testSettlePayment_RejectsMismatchedAmount() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder()
                .id(productId)
                .status(ProductStatus.PAYMENT_PENDING)
                .currentHighestBid(20000.0)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class, () ->
                settlementService.settlePayment(productId, UUID.randomUUID(), 10000.0, "TXN_UNDERPAID", "CARD")
        );
    }
}
