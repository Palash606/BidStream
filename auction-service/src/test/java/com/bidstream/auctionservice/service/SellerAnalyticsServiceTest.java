package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.SellerAnalyticsDTO;
import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Category;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SellerAnalyticsServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private SellerAnalyticsService analyticsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        analyticsService = new SellerAnalyticsService(productRepository, bidRepository, redisTemplate, objectMapper);
    }

    @Test
    void testGetSellerAnalytics_ComputesGrossNetAndCutCorrectly() {
        UUID sellerId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Category watchCategory = new Category();
        watchCategory.setId(1L);
        watchCategory.setName("Luxury Watches");

        Product soldProduct = Product.builder()
                .id(productId)
                .sellerId(sellerId)
                .name("Rolex Submariner")
                .status(ProductStatus.SOLD)
                .initialPrice(50000.0)
                .currentHighestBid(100000.0)
                .category(watchCategory)
                .build();

        when(productRepository.findBySellerId(sellerId)).thenReturn(List.of(soldProduct));
        when(bidRepository.countBidsForProducts(anyList())).thenReturn(14L);

        Bid recentBid = Bid.builder()
                .id(1L)
                .productId(productId)
                .amount(100000.0)
                .bidTime(LocalDateTime.now().minusHours(2))
                .build();
        when(bidRepository.findBidsForProductsSince(anyList(), any())).thenReturn(List.of(recentBid));

        SellerAnalyticsDTO result = analyticsService.getSellerAnalytics(sellerId, "WEEK");

        assertNotNull(result);
        assertEquals(100000.0, result.getGrossMerchandiseValue());
        // 5% cut = 5000.0
        assertEquals(5000.0, result.getPlatformCut());
        // 95% net payout = 95000.0
        assertEquals(95000.0, result.getNetEarnings());
        assertEquals(1, result.getSoldLotsCount());
        assertEquals(14L, result.getTotalBidsReceived());

        // Category breakdown verification
        assertEquals(1, result.getCategoryBreakdown().size());
        assertEquals("Luxury Watches", result.getCategoryBreakdown().get(0).getCategoryName());
        assertEquals(100.0, result.getCategoryBreakdown().get(0).getPercentage());
    }

    @Test
    void testGetSellerAnalytics_ReturnsCachedWhenPresentInRedis() throws Exception {
        UUID sellerId = UUID.randomUUID();
        SellerAnalyticsDTO cachedDto = SellerAnalyticsDTO.builder()
                .grossMerchandiseValue(250000.0)
                .platformCut(12500.0)
                .netEarnings(237500.0)
                .totalBidsReceived(45L)
                .period("WEEK")
                .build();
        String json = objectMapper.writeValueAsString(cachedDto);

        when(valueOperations.get(SellerAnalyticsService.CACHE_PREFIX + sellerId + ":WEEK")).thenReturn(json);

        SellerAnalyticsDTO result = analyticsService.getSellerAnalytics(sellerId, "WEEK");

        assertEquals(250000.0, result.getGrossMerchandiseValue());
        verify(productRepository, never()).findBySellerId(any());
    }
}
