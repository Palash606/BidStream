package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DiscoveryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private IdentityClient identityClient;

    /**
     * Fetches personalized recommendations and upcoming auctions for the bidder dashboard.
     */
    public Map<String, List<Product>> getDiscoveryData(UUID userId) {
        Map<String, List<Product>> discoveryData = new HashMap<>();

        // 1. Fetch User Interests from Identity Service
        UserDTO user = identityClient.getUserDetails(userId);
        List<String> interests = user.getInterests();

        // 2. Fetch Recommended Products based on interests
        if (interests != null && !interests.isEmpty()) {
            discoveryData.put("recommended", productRepository.findByCategoryNames(interests));
        } else {
            discoveryData.put("recommended", List.of());
        }

        // 3. Fetch "Ending Soon" Auctions (finishing within the next 1 hour)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusHours(1);
        discoveryData.put("endingSoon", productRepository.findEndingSoon(now, soon));

        // 4. Fetch General Live Auctions (Top 6 latest)
        // Note: In a real app, you'd use a Paging result here
        discoveryData.put("live", productRepository.findByStatus(com.bidstream.auctionservice.entity.ProductStatus.ACTIVE));

        return discoveryData;
    }
}
