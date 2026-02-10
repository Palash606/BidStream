package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.dto.BidHistoryDTO;
import com.bidstream.auctionservice.service.BidService;
import com.bidstream.auctionservice.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    @Autowired
    private BidService bidService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/place")
    public ResponseEntity<String> placeBid(
            @RequestParam UUID productId,
            @RequestParam Double amount,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        UUID bidderId = jwtService.extractUserId(token);
        String username = jwtService.extractUsername(token);

        String response = bidService.placeBid(productId, bidderId, username, amount);
        return response.equals("Bid accepted!") ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/history/{productId}")
    public ResponseEntity<List<BidHistoryDTO>> getHistory(@PathVariable UUID productId) {
        return ResponseEntity.ok(bidService.getProductBidHistory(productId));
    }
}