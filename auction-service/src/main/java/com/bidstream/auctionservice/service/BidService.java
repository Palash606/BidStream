package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.bidstream.auctionservice.dto.BidHistoryDTO;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {
    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final RedissonClient redissonClient;

    public List<BidHistoryDTO> getProductBidHistory(UUID productId) {
        Product product = productRepository.findById(productId).orElseThrow();
        List<Bid> bids = bidRepository.findByProductIdOrderByAmountDesc(productId);

        return bids.stream().map(bid -> BidHistoryDTO.builder()
                .amount(bid.getAmount())
                .bidTime(bid.getBidTime())
                // Use the Product Entity logic we defined
                .maskedName(product.getMaskedWinnerName(bid.getBidderName()))
                .userColorHex(product.getUsernameColorHex())
                .isHighest(bid.getAmount().equals(product.getCurrentHighestBid()))
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public String placeBid(UUID productId, UUID bidderId, String bidderName, Double amount) {
        RLock lock = redissonClient.getLock("bid-lock:" + productId);
        try {
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                Product product = productRepository.findById(productId).orElseThrow();
                if (product.getStatus() != ProductStatus.ACTIVE) return "Auction not active.";

                double minIncrement = calculateMinIncrement(product.getCurrentHighestBid() == null ? product.getInitialPrice() : product.getCurrentHighestBid());
                double currentPrice = product.getCurrentHighestBid() == null ? product.getInitialPrice() : product.getCurrentHighestBid();

                if (amount < (currentPrice + minIncrement)) {
                    return "Minimum next bid must be ₹" + (currentPrice + minIncrement);
                }

                product.setCurrentHighestBid(amount);
                product.setWinnerId(bidderId);
                productRepository.save(product);

                // Save individual bid record
                bidRepository.save(Bid.builder()
                        .productId(productId)
                        .bidderId(bidderId)
                        .bidderName(bidderName)
                        .amount(amount)
                        .build());

                // Reset the "Three-Hit" timer (IPL Logic)
                redissonClient.getBucket("auction-timer:" + productId).set(System.currentTimeMillis());
                redissonClient.getBucket("auction-hit-count:" + productId).set(0);

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