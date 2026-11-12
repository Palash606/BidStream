package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.dto.SellerAnalyticsDTO;
import com.bidstream.auctionservice.security.SecurityUtils;
import com.bidstream.auctionservice.service.SellerAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products/seller/analytics")
@RequiredArgsConstructor
@Slf4j
public class SellerAnalyticsController {

    private final SellerAnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<SellerAnalyticsDTO> getSellerAnalytics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "period", defaultValue = "WEEK") String period
    ) {
        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
        log.info("Fetching analytics for seller: {} over period: {}", sellerId, period);
        SellerAnalyticsDTO analytics = analyticsService.getSellerAnalytics(sellerId, period);
        return ResponseEntity.ok(analytics);
    }
}
