package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RedissonClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionManagerService {

    private final ProductRepository productRepository;
    private final IdentityClient identityClient;
    private final NotificationService notificationService;
    private final RedissonClient redissonClient;

    @Scheduled(fixedRate = 10000) // Check every 10 seconds for more responsiveness
    @Transactional
    public void processRealTimeAuctions() {
        List<Product> activeProducts = productRepository.findByStatus(ProductStatus.ACTIVE);

        for (Product product : activeProducts) {
            Long lastBidTime = (Long) redissonClient.getBucket("auction-timer:" + product.getId()).get();
            if (lastBidTime == null) continue;

            long silenceDuration = System.currentTimeMillis() - lastBidTime;
            Integer hits = (Integer) redissonClient.getBucket("auction-hit-count:" + product.getId()).get();
            if (hits == null) hits = 0;

            if (silenceDuration > 60000 && hits == 0) {
                log.info("AUCTION: {} - GOING ONCE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(1);
            } else if (silenceDuration > 90000 && hits == 1) {
                log.info("AUCTION: {} - GOING TWICE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(2);
            } else if (silenceDuration > 120000 && hits == 2) {
                log.info("AUCTION: {} - SOLD!", product.getName());
                handleAuctionEnd(product); // Existing logic to set status and email
                redissonClient.getBucket("auction-timer:" + product.getId()).delete();
            }
        }
    }

    @Scheduled(fixedRate = 30000) // Check every 30 seconds
    @Transactional
    public void activateScheduledAuctions() {
        log.info("Checking for auctions to activate...");

        // Find all scheduled products
        List<Product> scheduledProducts = productRepository.findByStatus(ProductStatus.SCHEDULED);

        for (Product product : scheduledProducts) {
            // Logic: If we added a startTime field, we'd check it here.
            // For now, let's assume 'SCHEDULED' products are activated by an admin or a specific trigger.
            // If you want them to go live immediately upon a certain condition:
            product.setStatus(ProductStatus.ACTIVE);

            // CRITICAL: Initialize the Redis timer so the "Three-Hit" logic knows when the auction started
            redissonClient.getBucket("auction-timer:" + product.getId()).set(System.currentTimeMillis());
            redissonClient.getBucket("auction-hit-count:" + product.getId()).set(0);

            log.info("AUCTION LIVE: {} is now accepting bids!", product.getName());
        }
        productRepository.saveAll(scheduledProducts);
    }

    // Checks every 1 minute (60,000 ms)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processExpiredAuctions() {
        log.info("Checking for expired auctions at {}", LocalDateTime.now());

        List<Product> expiredProducts = productRepository.findExpiredActiveAuctions(
                LocalDateTime.now(), ProductStatus.ACTIVE);

        for (Product product : expiredProducts) {
            handleAuctionEnd(product);
        }
    }

    private void handleAuctionEnd(Product product) {
        if (product.getWinnerId() == null) {
            product.setStatus(ProductStatus.UNSOLD);
            log.info("Auction for {} ended with no winner.", product.getName());
        } else {
            product.setStatus(ProductStatus.PAYMENT_PENDING);

            // Fetch Real Names using the IdentityClient
            UserDTO winner = identityClient.getUserDetails(product.getWinnerId());
            UserDTO seller = identityClient.getUserDetails(product.getSellerId());

            sendWinnerNotification(product, winner, seller);
        }
        productRepository.save(product);
    }

    private void sendWinnerNotification(Product product, UserDTO winner, UserDTO seller) {
        Map<String, Object> model = new HashMap<>();
        model.put("winnerName", winner.getFirstName() + " " + winner.getLastName());
        model.put("productName", product.getName());
        model.put("finalPrice", product.getCurrentHighestBid());
        model.put("sellerName", seller.getFirstName() + " " + seller.getLastName());
        model.put("paymentLink", "http://localhost:3000/pay/" + product.getId());

        notificationService.sendWinnerEmail(
                winner.getEmail(),
                "🏆 Congratulations! You won the auction for " + product.getName(),
                model
        );
    }
}