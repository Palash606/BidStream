package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.dto.ProductRequest;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import com.bidstream.auctionservice.security.SecurityUtils;
import com.bidstream.auctionservice.service.ImageStorageService;
import com.bidstream.auctionservice.service.ProductSearchService;
import com.bidstream.auctionservice.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private SecurityUtils securityUtils;

    @Autowired
    private ImageStorageService imageStorageService;

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {

        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
        Product created = productService.createProduct(request, images, sellerId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable UUID id,
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {

        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);

        Product updatedFields = new Product();
        updatedFields.setName(request.getName());
        updatedFields.setDescription(request.getDescription());
        updatedFields.setInitialPrice(request.getInitialPrice());
        updatedFields.setWeight(request.getWeight());
        updatedFields.setDimensions(request.getDimensions());
        updatedFields.setManufacturer(request.getManufacturer());
        updatedFields.setAuctionType(request.getAuctionType());
        updatedFields.setAuctionEndTime(request.getAuctionEndTime());

        if (images != null && !images.isEmpty()) {
            try {
                List<String> urls = imageStorageService.saveImagesAsync(images).get();
                updatedFields.setImageUrls(urls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images during update", e);
            }
        }

        return ResponseEntity.ok(productService.updateProduct(id, sellerId, updatedFields));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam ProductStatus status,
            @RequestHeader("Authorization") String authHeader) {

        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
        Product p = productRepository.findById(id).orElseThrow();
        if (!p.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: product does not belong to this seller");
        }
        productService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {

        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
        productService.deleteProduct(id, sellerId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/seller")
    public ResponseEntity<Page<Product>> getSellerProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable) {

        UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
        return ResponseEntity.ok(productService.getSellerProducts(sellerId, categoryId, status, pageable));
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
        return ResponseEntity.ok(productRepository.findByWinnerIdAndStatusIn(
                userId, List.of(ProductStatus.SOLD, ProductStatus.PAYMENT_PENDING)));
    }

    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuth(
            @RequestHeader("Authorization") String authHeader,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(java.util.Map.of(
                "springAuthorities", authentication != null ? authentication.getAuthorities().toString() : "NULL",
                "resolvedSellerId", securityUtils.getAuthenticatedUserId(authHeader).toString(),
                "isAuthenticated", authentication != null && authentication.isAuthenticated()));
    }
}