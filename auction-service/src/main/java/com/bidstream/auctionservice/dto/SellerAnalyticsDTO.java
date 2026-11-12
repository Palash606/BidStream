package com.bidstream.auctionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerAnalyticsDTO implements Serializable {
    private double grossMerchandiseValue; // Total sold lots value
    private double platformCut;           // 5% platform fee
    private double netEarnings;           // 95% net seller payout
    private double pendingPayout;         // Lots in PAYMENT_PENDING
    private long totalLots;               // Total seller lots
    private long activeLotsCount;         // Currently live
    private long soldLotsCount;           // Successfully sold
    private long totalBidsReceived;       // Total bids received across all lots
    private String period;                // 24H, WEEK, MONTH, YEAR

    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<TimeBasedMetricDTO> timeSeries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownDTO implements Serializable {
        private String categoryName;
        private long soldCount;
        private double totalVolume;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeBasedMetricDTO implements Serializable {
        private String timeLabel;
        private long bidCount;
        private double volume;
    }
}
