package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.SellerAnalyticsDTO;
import com.bidstream.auctionservice.entity.Bid;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.BidRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SellerAnalyticsService {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public static final String CACHE_PREFIX = "seller:analytics:";
    public static final Duration CACHE_TTL = Duration.ofSeconds(30);

    public SellerAnalyticsDTO getSellerAnalytics(UUID sellerId, String period) {
        String normalizedPeriod = (period == null || period.isBlank()) ? "WEEK" : period.toUpperCase();
        String cacheKey = CACHE_PREFIX + sellerId + ":" + normalizedPeriod;

        // 1. Check Redis Cache for Near-Live Load Protection (30s TTL)
        try {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null && !cachedJson.isBlank()) {
                log.debug("Serving seller analytics from Redis cache for key: {}", cacheKey);
                return objectMapper.readValue(cachedJson, SellerAnalyticsDTO.class);
            }
        } catch (Exception e) {
            log.warn("Redis cache read failed for analytics: {}", e.getMessage());
        }

        // 2. Compute Analytics from Database
        SellerAnalyticsDTO analytics = computeAnalytics(sellerId, normalizedPeriod);

        // 3. Cache Result in Redis with 30s TTL
        try {
            String json = objectMapper.writeValueAsString(analytics);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache seller analytics in Redis: {}", e.getMessage());
        }

        return analytics;
    }

    private SellerAnalyticsDTO computeAnalytics(UUID sellerId, String period) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        if (products == null || products.isEmpty()) {
            return SellerAnalyticsDTO.builder()
                    .grossMerchandiseValue(0.0)
                    .platformCut(0.0)
                    .netEarnings(0.0)
                    .pendingPayout(0.0)
                    .totalLots(0)
                    .activeLotsCount(0)
                    .soldLotsCount(0)
                    .totalBidsReceived(0)
                    .period(period)
                    .categoryBreakdown(Collections.emptyList())
                    .timeSeries(Collections.emptyList())
                    .build();
        }

        List<UUID> productIds = products.stream().map(Product::getId).collect(Collectors.toList());

        long activeCount = products.stream().filter(p -> p.getStatus() == ProductStatus.ACTIVE).count();
        long soldCount = products.stream().filter(p -> p.getStatus() == ProductStatus.SOLD).count();

        double gmv = products.stream()
                .filter(p -> p.getStatus() == ProductStatus.SOLD)
                .mapToDouble(p -> p.getCurrentHighestBid() != null ? p.getCurrentHighestBid() : (p.getInitialPrice() != null ? p.getInitialPrice() : 0.0))
                .sum();

        double pendingPayout = products.stream()
                .filter(p -> p.getStatus() == ProductStatus.PAYMENT_PENDING)
                .mapToDouble(p -> p.getCurrentHighestBid() != null ? p.getCurrentHighestBid() : 0.0)
                .sum();

        double platformCut = Math.round(gmv * 0.05 * 100.0) / 100.0; // 5% fee
        double netEarnings = Math.round((gmv - platformCut) * 100.0) / 100.0; // 95% net payout

        long totalBids = bidRepository.countBidsForProducts(productIds);

        // Category Breakdown
        Map<String, List<Product>> byCategory = products.stream()
                .filter(p -> p.getStatus() == ProductStatus.SOLD)
                .collect(Collectors.groupingBy(p -> p.getCategory() != null ? p.getCategory().getName() : "General"));

        List<SellerAnalyticsDTO.CategoryBreakdownDTO> categoryBreakdown = new ArrayList<>();
        for (Map.Entry<String, List<Product>> entry : byCategory.entrySet()) {
            String catName = entry.getKey();
            List<Product> catProducts = entry.getValue();
            long catSoldCount = catProducts.size();
            double catVolume = catProducts.stream()
                    .mapToDouble(p -> p.getCurrentHighestBid() != null ? p.getCurrentHighestBid() : 0.0)
                    .sum();
            double pct = gmv > 0 ? Math.round((catVolume / gmv) * 1000.0) / 10.0 : 0.0;

            categoryBreakdown.add(SellerAnalyticsDTO.CategoryBreakdownDTO.builder()
                    .categoryName(catName)
                    .soldCount(catSoldCount)
                    .totalVolume(catVolume)
                    .percentage(pct)
                    .build());
        }

        // Time Series Metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since;
        switch (period) {
            case "24H" -> since = now.minusHours(24);
            case "MONTH" -> since = now.minusDays(30);
            case "YEAR" -> since = now.minusYears(1);
            default -> since = now.minusDays(7); // "WEEK"
        }

        List<Bid> bids = bidRepository.findBidsForProductsSince(productIds, since);
        List<SellerAnalyticsDTO.TimeBasedMetricDTO> timeSeries = buildTimeSeries(bids, period, now);

        return SellerAnalyticsDTO.builder()
                .grossMerchandiseValue(gmv)
                .platformCut(platformCut)
                .netEarnings(netEarnings)
                .pendingPayout(pendingPayout)
                .totalLots(products.size())
                .activeLotsCount(activeCount)
                .soldLotsCount(soldCount)
                .totalBidsReceived(totalBids)
                .period(period)
                .categoryBreakdown(categoryBreakdown)
                .timeSeries(timeSeries)
                .build();
    }

    private List<SellerAnalyticsDTO.TimeBasedMetricDTO> buildTimeSeries(List<Bid> bids, String period, LocalDateTime now) {
        List<SellerAnalyticsDTO.TimeBasedMetricDTO> series = new ArrayList<>();
        DateTimeFormatter hourFmt = DateTimeFormatter.ofPattern("HH:00");
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE");
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM");

        if ("24H".equals(period)) {
            // 6 intervals of 4 hours
            for (int i = 5; i >= 0; i--) {
                LocalDateTime start = now.minusHours((i + 1) * 4L);
                LocalDateTime end = now.minusHours(i * 4L);
                String label = end.format(hourFmt);
                long count = bids.stream()
                        .filter(b -> b.getBidTime() != null && !b.getBidTime().isBefore(start) && b.getBidTime().isBefore(end))
                        .count();
                double vol = bids.stream()
                        .filter(b -> b.getBidTime() != null && !b.getBidTime().isBefore(start) && b.getBidTime().isBefore(end))
                        .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                        .sum();
                series.add(new SellerAnalyticsDTO.TimeBasedMetricDTO(label, count, vol));
            }
        } else if ("MONTH".equals(period)) {
            // 4 intervals of 7-8 days
            for (int i = 3; i >= 0; i--) {
                LocalDateTime start = now.minusDays((i + 1) * 7L);
                LocalDateTime end = now.minusDays(i * 7L);
                String label = "Wk " + (4 - i);
                long count = bids.stream()
                        .filter(b -> b.getBidTime() != null && !b.getBidTime().isBefore(start) && b.getBidTime().isBefore(end))
                        .count();
                double vol = bids.stream()
                        .filter(b -> b.getBidTime() != null && !b.getBidTime().isBefore(start) && b.getBidTime().isBefore(end))
                        .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                        .sum();
                series.add(new SellerAnalyticsDTO.TimeBasedMetricDTO(label, count, vol));
            }
        } else if ("YEAR".equals(period)) {
            // 12 monthly buckets
            for (int i = 11; i >= 0; i--) {
                LocalDateTime targetMonth = now.minusMonths(i);
                String label = targetMonth.format(monthFmt);
                long count = bids.stream()
                        .filter(b -> b.getBidTime() != null && b.getBidTime().getYear() == targetMonth.getYear() && b.getBidTime().getMonth() == targetMonth.getMonth())
                        .count();
                double vol = bids.stream()
                        .filter(b -> b.getBidTime() != null && b.getBidTime().getYear() == targetMonth.getYear() && b.getBidTime().getMonth() == targetMonth.getMonth())
                        .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                        .sum();
                series.add(new SellerAnalyticsDTO.TimeBasedMetricDTO(label, count, vol));
            }
        } else {
            // Default "WEEK": 7 daily buckets
            for (int i = 6; i >= 0; i--) {
                LocalDateTime day = now.minusDays(i);
                String label = day.format(dayFmt);
                long count = bids.stream()
                        .filter(b -> b.getBidTime() != null && b.getBidTime().toLocalDate().equals(day.toLocalDate()))
                        .count();
                double vol = bids.stream()
                        .filter(b -> b.getBidTime() != null && b.getBidTime().toLocalDate().equals(day.toLocalDate()))
                        .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                        .sum();
                series.add(new SellerAnalyticsDTO.TimeBasedMetricDTO(label, count, vol));
            }
        }

        return series;
    }
}
