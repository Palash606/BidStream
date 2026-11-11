package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.GavelEventDTO;
import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.event.AuctionEndedEvent;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionManagerService {

    private static final Logger log = LoggerFactory.getLogger(AuctionManagerService.class);
    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final RedissonClient redissonClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public AuctionManagerService(ProductRepository productRepository,
            BidRepository bidRepository,
            RedissonClient redissonClient,
            SimpMessagingTemplate messagingTemplate,
            ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.bidRepository = bidRepository;
        this.redissonClient = redissonClient;
        this.messagingTemplate = messagingTemplate;
        this.eventPublisher = eventPublisher;
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

            Double price = product.getCurrentHighestBid() != null ? product.getCurrentHighestBid() : product.getInitialPrice();
            String formattedPrice = price != null ? String.format("%.0f", price) : "0";

            Optional<Bid> topBid = bidRepository.findFirstByProductIdOrderByAmountDesc(product.getId());
            String leadingBidderName = topBid.map(b -> product.getMaskedWinnerName(b.getBidderName())).orElse("Reserve Price");

            if (silenceDuration > 60000 && hits == 0) {
                log.info("AUCTION: {} - GOING ONCE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(1);

                GavelEventDTO event = GavelEventDTO.builder()
                        .productId(product.getId())
                        .hitCount(1)
                        .stage("GOING_ONCE")
                        .message("🔨 GOING ONCE to " + leadingBidderName + " at ₹" + formattedPrice + "!")
                        .currentHighestBid(price)
                        .winnerMaskedName(leadingBidderName)
                        .timestamp(System.currentTimeMillis())
                        .build();
                messagingTemplate.convertAndSend("/topic/auction/" + product.getId() + "/gavel", event);

            } else if (silenceDuration > 90000 && hits == 1) {
                log.info("AUCTION: {} - GOING TWICE!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(2);

                GavelEventDTO event = GavelEventDTO.builder()
                        .productId(product.getId())
                        .hitCount(2)
                        .stage("GOING_TWICE")
                        .message("🔨🔨 GOING TWICE to " + leadingBidderName + " at ₹" + formattedPrice + "! Final call!")
                        .currentHighestBid(price)
                        .winnerMaskedName(leadingBidderName)
                        .timestamp(System.currentTimeMillis())
                        .build();
                messagingTemplate.convertAndSend("/topic/auction/" + product.getId() + "/gavel", event);

            } else if (silenceDuration > 120000 && hits == 2) {
                log.info("AUCTION: {} - SOLD!", product.getName());
                redissonClient.getBucket("auction-hit-count:" + product.getId()).set(3);

                GavelEventDTO event = GavelEventDTO.builder()
                        .productId(product.getId())
                        .hitCount(3)
                        .stage("SOLD")
                        .message("🔨🔨🔨 SOLD to " + leadingBidderName + " for ₹" + formattedPrice + "!")
                        .currentHighestBid(price)
                        .winnerMaskedName(leadingBidderName)
                        .timestamp(System.currentTimeMillis())
                        .build();
                messagingTemplate.convertAndSend("/topic/auction/" + product.getId() + "/gavel", event);

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
            log.info("Auction for {} won by bidder {}. Payment pending.", product.getName(), product.getWinnerId());
            // Decoupled asynchronous notification delivery (outside the open DB transaction)
            eventPublisher.publishEvent(AuctionEndedEvent.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .winnerId(product.getWinnerId())
                    .sellerId(product.getSellerId())
                    .finalPrice(product.getCurrentHighestBid())
                    .build());
        }
        productRepository.save(product);
    }
}
