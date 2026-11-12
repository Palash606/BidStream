package com.bidstream.auctionservice.listener;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.event.AuctionEndedEvent;
import com.bidstream.auctionservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionNotificationListener {

    private final IdentityClient identityClient;
    private final NotificationService notificationService;

    @Value("${auction.payment-base-url:http://localhost:5173/pay/}")
    private String paymentBaseUrl;

    @Async("auctionTaskExecutor")
    @EventListener
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2.0))
    public void onAuctionEnded(AuctionEndedEvent event) {
        log.info("Processing asynchronous auction end notifications for product: {}", event.getProductName());

        UserDTO winner = identityClient.getUserDetails(event.getWinnerId());
        UserDTO seller = identityClient.getUserDetails(event.getSellerId());

        if (winner != null && winner.getEmail() != null) {
            Map<String, Object> model = new HashMap<>();
            model.put("winnerName", winner.getFirstName() + " " + winner.getLastName());
            model.put("productName", event.getProductName());
            model.put("finalPrice", event.getFinalPrice());
            model.put("sellerName", seller != null ? (seller.getFirstName() + " " + seller.getLastName()) : "BidStream Seller");
            model.put("paymentLink", paymentBaseUrl + event.getProductId());

            notificationService.sendWinnerEmail(
                    winner.getEmail(),
                    "🏆 Congratulations! You won the auction for " + event.getProductName(),
                    model);
        }
    }

    @Recover
    public void recoverAuctionNotification(Exception ex, AuctionEndedEvent event) {
        LoggerFactory.getLogger("DLQ").error(
                "[DLQ] CRITICAL: All retry attempts exhausted for auction notification. " +
                "ProductId={}, ProductName={}, WinnerId={}, FinalPrice={}. " +
                "Manual intervention required. Cause: {}",
                event.getProductId(),
                event.getProductName(),
                event.getWinnerId(),
                event.getFinalPrice(),
                ex.getMessage(),
                ex);
    }
}
