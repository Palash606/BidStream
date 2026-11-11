package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.BidHistoryDTO;
import com.bidstream.auctionservice.dto.GavelEventDTO;
import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {
    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final RedissonClient redissonClient;
    private final SimpMessagingTemplate messagingTemplate;

    public List<BidHistoryDTO> getProductBidHistory(UUID productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return Collections.emptyList();
        }
        List<Bid> bids = bidRepository.findByProductIdOrderByAmountDesc(productId);

        return bids.stream().map(bid -> BidHistoryDTO.builder()
                .amount(bid.getAmount())
                .bidTime(bid.getBidTime())
                .maskedName(product.getMaskedWinnerName(bid.getBidderName()))
                .userColorHex(product.getUsernameColorHex())
                .isHighest(bid.getAmount() != null && bid.getAmount().equals(product.getCurrentHighestBid()))
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public String placeBid(UUID productId, UUID bidderId, String bidderName, Double amount) {
        RLock lock = redissonClient.getLock("bid-lock:" + productId);
        try {
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                Product product = productRepository.findById(productId).orElse(null);
                if (product == null) return "Product not found.";
                if (product.getStatus() != ProductStatus.ACTIVE) return "Auction not active.";

                // Prevent seller shill bidding on own product
                if (bidderId.equals(product.getSellerId())) {
                    return "Sellers cannot bid on their own listings.";
                }

                Double basePrice = product.getCurrentHighestBid() != null ? product.getCurrentHighestBid() : product.getInitialPrice();
                double currentPrice = basePrice != null ? basePrice : 0.0;
                double minIncrement = calculateMinIncrement(currentPrice);

                if (amount < (currentPrice + minIncrement)) {
                    return "Minimum next bid must be ₹" + String.format("%.0f", (currentPrice + minIncrement));
                }

                product.setCurrentHighestBid(amount);
                product.setWinnerId(bidderId);
                productRepository.save(product);

                // Save individual bid record
                Bid savedBid = bidRepository.save(Bid.builder()
                        .productId(productId)
                        .bidderId(bidderId)
                        .bidderName(bidderName)
                        .amount(amount)
                        .build());

                // Reset the "Three-Hit" timer (IPL Logic)
                redissonClient.getBucket("auction-timer:" + productId).set(System.currentTimeMillis());
                redissonClient.getBucket("auction-hit-count:" + productId).set(0);

                LocalDateTime bidTime = savedBid.getBidTime() != null ? savedBid.getBidTime() : LocalDateTime.now();

                // Real-time broadcast to connected bidders
                BidHistoryDTO bidDTO = BidHistoryDTO.builder()
                        .amount(savedBid.getAmount())
                        .bidTime(bidTime)
                        .maskedName(product.getMaskedWinnerName(bidderName))
                        .userColorHex(product.getUsernameColorHex())
                        .isHighest(true)
                        .build();
                messagingTemplate.convertAndSend("/topic/auction/" + productId, bidDTO);

                // Broadcast Gavel Reset / Live Tick
                GavelEventDTO gavelReset = GavelEventDTO.builder()
                        .productId(productId)
                        .hitCount(0)
                        .stage("LIVE")
                        .message("New leading bid placed!")
                        .currentHighestBid(amount)
                        .winnerMaskedName(product.getMaskedWinnerName(bidderName))
                        .timestamp(System.currentTimeMillis())
                        .build();
                messagingTemplate.convertAndSend("/topic/auction/" + productId + "/gavel", gavelReset);

                return "Bid accepted!";
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
        return "System busy, try again.";
    }

    private double calculateMinIncrement(Double currentPrice) {
        if (currentPrice == null || currentPrice < 10000) {
            return 500.0;
        } else if (currentPrice < 100000) {
            return 2000.0;
        } else if (currentPrice < 1000000) {
            return 10000.0;
        } else if (currentPrice < 10000000) {
            return 50000.0;
        } else {
            return Math.floor(currentPrice * 0.01); // 1% of current price
        }
    }
}