package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.dto.ProductRequest;
import com.bidstream.auctionservice.entity.Category;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.exception.UnverifiedSellerException;
import com.bidstream.auctionservice.repository.CategoryRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SellerVerificationService sellerVerificationService;

    @Autowired
    private ImageStorageService imageStorageService;

    // ── Write operations ───────────────────────────────────────────────────────

    /**
     * Creates a new product listing.
     *
     * Flow:
     * 1. Assert seller is verified (throws UnverifiedSellerException if not).
     * 2. Map ProductRequest DTO → Product entity.
     * 3. Resolve or create the category.
     * 4. Upload images (IOException is surfaced as RuntimeException so the
     * transaction rolls back cleanly and no partial state is persisted).
     * 5. Persist to DB within the transaction.
     *
     * @param request  validated product request DTO
     * @param images   zero or more product images (may be null)
     * @param sellerId UUID extracted from the authenticated JWT
     * @return the persisted Product entity
     */
    @Transactional
    public Product createProduct(ProductRequest request, List<MultipartFile> images, UUID sellerId) {
        // ── Step 1: Verify seller ─────────────────────────────────────────────
        sellerVerificationService.assertVerified(sellerId);

        // ── Step 2: Map DTO → entity ──────────────────────────────────────────
        Product product = new Product();
        product.setSellerId(sellerId);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setInitialPrice(request.getInitialPrice());
        product.setCurrentHighestBid(request.getInitialPrice()); // seed bid at starting price
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setManufacturer(request.getManufacturer());
        product.setAuctionType(request.getAuctionType());
        product.setAuctionEndTime(request.getAuctionEndTime());
        product.setStatus(resolveInitialStatus(request.getAuctionType()));

        // ── Step 3: Resolve category ──────────────────────────────────────────
        if (request.getCategoryName() != null) {
            Category category = categoryRepository.findByName(request.getCategoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(request.getCategoryName());
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }

        // ── Step 4: Persist images ────────────────────────────────────────────
        List<String> imageUrls = uploadImages(images);
        product.setImageUrls(imageUrls);

        // ── Step 5: Persist product ───────────────────────────────────────────
        Product saved = productRepository.save(product);
        log.info("Product created: id={} seller={} status={}", saved.getId(), sellerId, saved.getStatus());
        return saved;
    }

    /**
     * Legacy save method – kept for backward compatibility with other callers.
     * Prefer {@link #createProduct(ProductRequest, List, UUID)} for new code.
     */
    @Transactional
    public Product saveProduct(Product product, String categoryName) {
        sellerVerificationService.assertVerified(product.getSellerId());
        if (categoryName != null) {
            Category category = categoryRepository.findByName(categoryName)
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(categoryName);
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }
        if (product.getCurrentHighestBid() == null) {
            product.setCurrentHighestBid(product.getInitialPrice());
        }
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID productId, UUID sellerId) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        if (!existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }
        existing.setStatus(ProductStatus.CANCELED);
        productRepository.save(existing);
    }

    @Transactional
    public void updateStatus(UUID productId, ProductStatus newStatus) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        product.setStatus(newStatus);
        productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID productId, UUID sellerId, Product updatedProduct) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        if (!existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to update this product");
        }
        if (existing.getStatus() != ProductStatus.DRAFT && 
            existing.getStatus() != ProductStatus.SCHEDULED && 
            existing.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("Product cannot be updated while in status: " + existing.getStatus());
        }

        if (updatedProduct.getName() != null)
            existing.setName(updatedProduct.getName());
        if (updatedProduct.getDescription() != null)
            existing.setDescription(updatedProduct.getDescription());
        if (updatedProduct.getInitialPrice() != null) {
            existing.setInitialPrice(updatedProduct.getInitialPrice());
            if (existing.getCurrentHighestBid() == null
                    || existing.getCurrentHighestBid() < updatedProduct.getInitialPrice()) {
                existing.setCurrentHighestBid(updatedProduct.getInitialPrice());
            }
        }
        if (updatedProduct.getWeight() != null)
            existing.setWeight(updatedProduct.getWeight());
        if (updatedProduct.getDimensions() != null)
            existing.setDimensions(updatedProduct.getDimensions());
        if (updatedProduct.getManufacturer() != null)
            existing.setManufacturer(updatedProduct.getManufacturer());
        if (updatedProduct.getImageUrls() != null)
            existing.setImageUrls(updatedProduct.getImageUrls());
        if (updatedProduct.getAuctionEndTime() != null)
            existing.setAuctionEndTime(updatedProduct.getAuctionEndTime());

        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            Category cat = categoryRepository.findById(updatedProduct.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(cat);
        }
        return productRepository.save(existing);
    }

    @Transactional
    public Product scheduleAuction(UUID productId, UUID sellerId, LocalDateTime auctionEndTime) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        if (!product.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to schedule this product");
        }
        if (product.getStatus() != ProductStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT products can be scheduled");
        }
        if (auctionEndTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Auction end time must be in the future");
        }
        product.setAuctionEndTime(auctionEndTime);
        product.setStatus(ProductStatus.SCHEDULED);
        return productRepository.save(product);
    }

    // ── Read operations ────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of products belonging to the authenticated seller.
     * Optional filters for category and status are applied when provided.
     *
     * @param sellerId   the authenticated seller's UUID
     * @param categoryId optional category filter
     * @param status     optional status filter
     * @param pageable   Spring Data pageable (page, size, sort)
     */
    @Transactional(readOnly = true)
    public Page<Product> getSellerProducts(UUID sellerId, Long categoryId, ProductStatus status, Pageable pageable) {
        if (categoryId != null && status != null) {
            return productRepository.findBySellerIdAndCategoryIdAndStatus(sellerId, categoryId, status, pageable);
        } else if (categoryId != null) {
            return productRepository.findBySellerIdAndCategoryId(sellerId, categoryId, pageable);
        } else if (status != null) {
            return productRepository.findBySellerIdAndStatus(sellerId, status, pageable);
        }
        return productRepository.findBySellerId(sellerId, pageable);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private ProductStatus resolveInitialStatus(String auctionType) {
        if (auctionType == null)
            return ProductStatus.DRAFT;
        return switch (auctionType) {
            case "THREE_HAMMER" -> ProductStatus.ACTIVE;
            case "END_TIME" -> ProductStatus.SCHEDULED;
            default -> ProductStatus.DRAFT;
        };
    }

    @Transactional(readOnly = true)
    public Product getProductById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
    }

    /**
     * Uploads images via the configured ImageStorageService.
     * IOException is wrapped as RuntimeException to trigger transaction rollback.
     */
    private List<String> uploadImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return imageStorageService.saveImagesAsync(images).get();
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            log.error("Image upload failed", cause);
            throw new RuntimeException("Failed to upload product images: " + cause.getMessage(), cause);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Image upload interrupted", e);
        }
    }
}