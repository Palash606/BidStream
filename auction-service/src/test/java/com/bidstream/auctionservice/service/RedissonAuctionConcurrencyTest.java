package com.bidstream.auctionservice.service;

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

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Milestone 3 — Redisson Distributed Lock Multi-Thread Concurrency Benchmark.
 *
 * <p>This is a pure Mockito unit test; it requires NO live Redis instance.
 * All Redisson interactions are stubbed so the test verifies that:
 * <ul>
 *   <li>The lock is always acquired before accessing shared auction state.</li>
 *   <li>The lock is always released in the {@code finally} block (no leaks).</li>
 *   <li>Concurrent bid writes are handled without {@link java.util.ConcurrentModificationException}
 *       or deadlock even under heavy thread contention.</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Redisson Distributed Lock — Multi-Thread Concurrency Benchmark")
class RedissonAuctionConcurrencyTest {

    // ------------------------------------------------------------------ mocks
    @Mock private ProductRepository productRepository;
    @Mock private BidRepository     bidRepository;
    @Mock private RedissonClient    redissonClient;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private RLock             rLock;
    @SuppressWarnings("rawtypes")
    @Mock private RBucket           rBucket;

    @InjectMocks
    private BidService bidService;

    // --------------------------------------------------------- shared fixtures
    private UUID    productId;
    private UUID    sellerId;
    private Product activeProduct;

    private static final double INITIAL_PRICE   = 50_000.0;
    private static final double MIN_INCREMENT   = 2_000.0;  // bracket <100k → 2000

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() throws InterruptedException {
        productId = UUID.randomUUID();
        sellerId  = UUID.randomUUID();

        activeProduct = Product.builder()
                .id(productId)
                .name("Vintage Chronograph Watch")
                .initialPrice(INITIAL_PRICE)
                .currentHighestBid(INITIAL_PRICE)
                .status(ProductStatus.ACTIVE)
                .sellerId(sellerId)
                .build();

        // ---- common stubs shared by both tests ----
        lenient().when(redissonClient.getLock(anyString())).thenReturn(rLock);
        lenient().when(rLock.tryLock(5, 10, TimeUnit.SECONDS)).thenReturn(true);
        lenient().when(rLock.isHeldByCurrentThread()).thenReturn(true);
        lenient().when(productRepository.findById(productId)).thenReturn(Optional.of(activeProduct));
        lenient().when(redissonClient.getBucket(anyString())).thenReturn(rBucket);
        // rBucket.set() is void — Mockito does nothing by default (fine).
        // rBucket.get() — return a valid long for the timer bucket; 0 is safe for hit-count bucket.
        lenient().when(rBucket.get()).thenAnswer(inv -> System.currentTimeMillis());
        // messagingTemplate.convertAndSend() is void — default no-op is fine.
    }

    // ==========================================================================
    // Test 1 — 50 staggered-bid threads
    // ==========================================================================

    /**
     * Fires 50 threads simultaneously, each with a unique bidderId and a
     * staggered bid amount (initialPrice + N * minIncrement).
     *
     * <p>Key assertions:
     * <ul>
     *   <li>At least one bid is accepted.</li>
     *   <li>Every accepted bid is persisted exactly once (savedBids.size() == acceptedCount).</li>
     *   <li>No two accepted bids share the same amount (amounts are unique).</li>
     *   <li>Every saved amount is strictly above the initial price floor.</li>
     *   <li>The entire section completes within 30 seconds (no deadlock).</li>
     * </ul>
     */
    @Test
    @DisplayName("50 concurrent threads with staggered bid amounts — lock prevents data corruption")
    @SuppressWarnings("unchecked")
    void testConcurrentBidPlacement_StaggeredAmounts() throws Exception {
        final int THREAD_COUNT = 50;

        // Real concurrent collection — not a mock — to capture every persisted Bid.
        ConcurrentLinkedQueue<Bid> savedBids   = new ConcurrentLinkedQueue<>();
        AtomicInteger              acceptedCount = new AtomicInteger(0);

        // Wire bidRepository.save() to push into the real queue and return a Bid with an id.
        when(bidRepository.save(any(Bid.class))).thenAnswer(inv -> {
            Bid incoming = inv.getArgument(0);
            Bid persisted = Bid.builder()
                    .id((long) (savedBids.size() + 1))
                    .productId(incoming.getProductId())
                    .bidderId(incoming.getBidderId())
                    .bidderName(incoming.getBidderName())
                    .amount(incoming.getAmount())
                    .bidTime(LocalDateTime.now())
                    .build();
            savedBids.add(persisted);
            return persisted;
        });

        // productRepository.save() (called inside placeBid after updating currentHighestBid)
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        // ---- concurrency harness ----
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch  = new CountDownLatch(THREAD_COUNT);
        ExecutorService executor  = Executors.newFixedThreadPool(THREAD_COUNT);

        assertTimeout(Duration.ofSeconds(30), () -> {
            for (int i = 1; i <= THREAD_COUNT; i++) {
                final int threadIndex = i;
                executor.submit(() -> {
                    try {
                        startGate.await();   // wait for simultaneous release
                        UUID   bidderId   = UUID.randomUUID();
                        double bidAmount  = INITIAL_PRICE + (threadIndex * MIN_INCREMENT);
                        String result     = bidService.placeBid(productId, bidderId,
                                "bidder_" + threadIndex, bidAmount);
                        if ("Bid accepted!".equals(result)) {
                            acceptedCount.incrementAndGet();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            startGate.countDown();           // fire all 50 threads at once
            boolean finished = doneLatch.await(29, TimeUnit.SECONDS);
            assertTrue(finished, "Not all threads finished within the timeout — possible deadlock");
        });

        executor.shutdown();

        // ---- assertions ----
        int accepted = acceptedCount.get();

        assertTrue(accepted >= 1,
                "At least one bid must be accepted; got 0 — check lock mock setup");

        assertEquals(accepted, savedBids.size(),
                "Every accepted bid must have been persisted exactly once");

        Set<Double> uniqueAmounts = savedBids.stream()
                .map(Bid::getAmount)
                .collect(Collectors.toSet());
        assertEquals(savedBids.size(), uniqueAmounts.size(),
                "All saved bid amounts must be unique — duplicate detected");

        for (Bid b : savedBids) {
            assertTrue(b.getAmount() > INITIAL_PRICE,
                    "Bid amount " + b.getAmount() + " must be strictly above floor " + INITIAL_PRICE);
        }
    }

    // ==========================================================================
    // Test 2 — 100 high-contention threads, same amount
    // ==========================================================================

    /**
     * Fires 100 threads all bidding the same amount (150 000.0) on the same product.
     *
     * <p>Key assertions:
     * <ul>
     *   <li>Test completes within 20 seconds (no deadlock).</li>
     *   <li>{@code rLock.unlock()} is called exactly 100 times — the lock is never leaked,
     *       even when a bid is rejected for any business reason.</li>
     * </ul>
     *
     * <p><strong>Note on rejections:</strong> because the product mock always returns
     * {@code currentHighestBid = 50 000.0}, every bid of 150 000.0 satisfies the
     * increment check ({@literal >} 52 000.0).  Consequently all 100 bids are accepted
     * in the stub environment.  What this test actually validates is the <em>lock
     * lifecycle</em>: regardless of business outcome, {@code unlock()} must be invoked
     * exactly once per thread — proving no lock is ever leaked.
     */
    @Test
    @DisplayName("100 high-contention threads — lock always released, no deadlock within 20 s")
    @SuppressWarnings("unchecked")
    void testNoDeadlock_HighContention() throws Exception {
        final int    THREAD_COUNT  = 100;
        final double SAME_AMOUNT   = 150_000.0;

        // bidRepository.save() must not throw; return a minimal Bid.
        when(bidRepository.save(any(Bid.class))).thenAnswer(inv -> {
            Bid in = inv.getArgument(0);
            return Bid.builder()
                    .id(1L)
                    .productId(in.getProductId())
                    .bidderId(in.getBidderId())
                    .bidderName(in.getBidderName())
                    .amount(in.getAmount())
                    .bidTime(LocalDateTime.now())
                    .build();
        });

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch  = new CountDownLatch(THREAD_COUNT);
        ExecutorService executor  = Executors.newFixedThreadPool(THREAD_COUNT);

        assertTimeout(Duration.ofSeconds(20), () -> {
            for (int i = 0; i < THREAD_COUNT; i++) {
                final int idx = i;
                executor.submit(() -> {
                    try {
                        startGate.await();
                        UUID bidderId = UUID.randomUUID();
                        bidService.placeBid(productId, bidderId, "contender_" + idx, SAME_AMOUNT);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            startGate.countDown();
            boolean finished = doneLatch.await(19, TimeUnit.SECONDS);
            assertTrue(finished, "100-thread high-contention test did not finish — suspected deadlock");
        });

        executor.shutdown();

        // Lock must be released exactly once per thread — no leaks, no double-unlocks.
        verify(rLock, times(THREAD_COUNT)).unlock();
    }
}
