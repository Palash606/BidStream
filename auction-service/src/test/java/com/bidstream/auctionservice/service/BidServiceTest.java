package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.BidHistoryDTO;
import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RBucket;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private RLock rLock;

    @Mock
    private RBucket<Object> rBucket;

    @InjectMocks
    private BidService bidService;

    private UUID productId;
    private UUID sellerId;
    private UUID bidderId;
    private Product activeProduct;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        sellerId = UUID.randomUUID();
        bidderId = UUID.randomUUID();

        activeProduct = Product.builder()
                .id(productId)
                .name("Vintage Chronograph Watch")
                .initialPrice(50000.0)
                .currentHighestBid(50000.0)
                .status(ProductStatus.ACTIVE)
                .sellerId(sellerId)
                .build();
    }

    @Test
    @DisplayName("Successfully place bid and broadcast to STOMP topics")
    void testPlaceBid_Success() throws InterruptedException {
        when(redissonClient.getLock("bid-lock:" + productId)).thenReturn(rLock);
        when(rLock.tryLock(5, 10, TimeUnit.SECONDS)).thenReturn(true);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));
        when(redissonClient.getBucket(anyString())).thenReturn(rBucket);

        Bid savedBid = Bid.builder()
                .id(1L)
                .productId(productId)
                .bidderId(bidderId)
                .bidderName("alexander")
                .amount(55000.0)
                .bidTime(LocalDateTime.now())
                .build();

        when(bidRepository.save(any(Bid.class))).thenReturn(savedBid);

        String result = bidService.placeBid(productId, bidderId, "alexander", 55000.0);

        assertEquals("Bid accepted!", result);
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/auction/" + productId), any(BidHistoryDTO.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/auction/" + productId + "/gavel"), any(Object.class));
        verify(rLock).unlock();
    }

    @Test
    @DisplayName("Reject bid when auction is inactive or ended")
    void testPlaceBid_InactiveAuction() throws InterruptedException {
        when(redissonClient.getLock("bid-lock:" + productId)).thenReturn(rLock);
        when(rLock.tryLock(5, 10, TimeUnit.SECONDS)).thenReturn(true);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        activeProduct.setStatus(ProductStatus.SOLD);
        when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));

        String result = bidService.placeBid(productId, bidderId, "alexander", 60000.0);

        assertEquals("Auction not active.", result);
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        verify(rLock).unlock();
    }

    @Test
    @DisplayName("Reject seller bidding on their own auction (shill bidding prevention)")
    void testPlaceBid_SellerCannotBid() throws InterruptedException {
        when(redissonClient.getLock("bid-lock:" + productId)).thenReturn(rLock);
        when(rLock.tryLock(5, 10, TimeUnit.SECONDS)).thenReturn(true);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));

        // Seller tries to bid on own product
        String result = bidService.placeBid(productId, sellerId, "seller_user", 60000.0);

        assertEquals("Sellers cannot bid on their own listings.", result);
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        verify(rLock).unlock();
    }

    @Test
    @DisplayName("Reject bid below required minimum price increment")
    void testPlaceBid_BelowMinIncrement() throws InterruptedException {
        when(redissonClient.getLock("bid-lock:" + productId)).thenReturn(rLock);
        when(rLock.tryLock(5, 10, TimeUnit.SECONDS)).thenReturn(true);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));

        // Price is 50,000, bracket < 100,000 -> minIncrement is 2,000. Bid of 51,000 is too low.
        String result = bidService.placeBid(productId, bidderId, "alexander", 51000.0);

        assertTrue(result.contains("Minimum next bid must be ₹52000"));
        verify(bidRepository, never()).save(any(Bid.class));
        verify(rLock).unlock();
    }

    @Test
    @DisplayName("Get product bid history formatted with masked names and highest bid flagged")
    void testGetProductBidHistory() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));

        Bid bid1 = Bid.builder().amount(50000.0).bidderName("charlie").bidTime(LocalDateTime.now()).build();
        Bid bid2 = Bid.builder().amount(45000.0).bidderName("bob").bidTime(LocalDateTime.now().minusMinutes(5)).build();

        when(bidRepository.findByProductIdOrderByAmountDesc(productId)).thenReturn(List.of(bid1, bid2));

        List<BidHistoryDTO> history = bidService.getProductBidHistory(productId);

        assertEquals(2, history.size());
        assertTrue(history.get(0).isHighest());
        assertFalse(history.get(1).isHighest());
        assertEquals(50000.0, history.get(0).getAmount());
    }
}
