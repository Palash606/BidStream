package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import com.bidstream.auctionservice.service.JwtService;
import com.bidstream.auctionservice.service.ProductSearchService;
import com.bidstream.auctionservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private ProductSearchService searchService;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product,
            @RequestHeader("Authorization") String authHeader) {

        // Extract token from "Bearer <token>"
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);

        product.setSellerId(sellerId);
        product.setStatus(ProductStatus.DRAFT);

        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        return ResponseEntity.ok(searchService.globalSearch(userId, q, categoryId, minPrice, maxPrice));
    }

    @GetMapping("/my-winnings")
    public ResponseEntity<List<Product>> getMyWinnings(@RequestHeader("X-User-Id") UUID userId) {
        // Winner sees SOLD or PAYMENT_PENDING items they won
        return ResponseEntity.ok(productRepository.findByWinnerIdAndStatusIn(
                userId, List.of(ProductStatus.SOLD, ProductStatus.PAYMENT_PENDING)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable UUID id,
            @RequestBody Product product,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);

        return ResponseEntity.ok(productService.updateProduct(id, sellerId, product));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<Product> scheduleAuction(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime auctionEndTime,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);

        return ResponseEntity.ok(productService.scheduleAuction(id, sellerId, auctionEndTime));
    }
}