package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class ProductSearchService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private SearchHistoryService historyService;

    // auctionservice/service/ProductSearchService.java

    public List<Product> globalSearch(UUID userId, String query, Long catId, Double min, Double max) {
        // FIX: If query is null/empty but a category is selected, we should still search.
        String searchTerm = (query != null && query.length() >= 2) ? query : "";

        // 1. Save history only if there's an actual search string
        if (!searchTerm.isEmpty()) {
            historyService.saveSearch(userId, searchTerm);
        }

        // 2. Perform Search using your existing powerful @Query
        List<Product> results = productRepository.searchVisibleProducts(
                searchTerm,
                catId,
                min,
                max,
                null,
                null
        );

        // 3. Fallback logic only if a search string was actually provided
        if (results.isEmpty() && !searchTerm.isEmpty() && searchTerm.length() >= 3) {
            return productRepository.searchVisibleProducts(searchTerm.substring(0, 3), catId, min, max, null, null);
        }

        return results;
    }
}