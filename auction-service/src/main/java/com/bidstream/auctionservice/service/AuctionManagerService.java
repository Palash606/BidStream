package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuctionManagerService {

    private static final Logger log = LoggerFactory.getLogger(AuctionManagerService.class);
    private final ProductRepository productRepository;
    private final IdentityClient identityClient;
    private final NotificationService notificationService;
    private final RedissonClient redissonClient;

    public AuctionManagerService(ProductRepository productRepository,
            IdentityClient identityClient,
            NotificationService notificationService,
            RedissonClient redissonClient) {
        this.productRepository = productRepository;
        this.identityClient = identityClient;
        this.notificationService = notificationService;
        this.redissonClient = redissonClient;
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void processRealTimeAuctions() {
        List<Product> activeProducts = productRepository.findByStatus(ProductStatus.ACTIVE);

        for (Product product : activeProducts) {
            Long lastBidTime = (Long) redissonClient.getBucket("auction-timer:" + product.getId()).get();
            if (lastBidTime == null)
                continue;

            long silenceDuration = System.currentTimeMillis() - lastBidTime;
            Integer hits = (Integer) redissonClient.getBucket("auction-hit-count:" + product.getId()).get();
            if (hits == null)
                hits = 0;

            if (silenceDuration > 60000 && hits == 0) {
                log.info("AUCTION: {} - GOING ONCE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(1);
            } else if (silenceDuration > 90000 && hits == 1) {
                log.info("AUCTION: {} - GOING TWICE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(2);
            } else if (silenceDuration > 120000 && hits == 2) {
                log.info("AUCTION: {} - SOLD!", product.getName());
                handleAuctionEnd(product);
                redissonClient.getBucket("auction-timer:" + product.getId()).delete();
            }
        }
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void activateScheduledAuctions() {
        log.info("Checking for auctions to activate...");
        List<Product> scheduledProducts = productRepository.findByStatus(ProductStatus.SCHEDULED);
        for (Product product : scheduledProducts) {
            product.setStatus(ProductStatus.ACTIVE);
            redissonClient.getBucket("auction-timer:" + product.getId()).set(System.currentTimeMillis());
            redissonClient.getBucket("auction-hit-count:" + product.getId()).set(0);
            log.info("AUCTION LIVE: {} is now accepting bids!", product.getName());
        }
        productRepository.saveAll(scheduledProducts);
    }

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
                model);
    }
}