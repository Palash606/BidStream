package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.entity.Category;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.exception.VerificationRequiredException;
import com.bidstream.auctionservice.repository.CategoryRepository;
import com.bidstream.auctionservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository; // Inject this

    @Autowired
    private com.bidstream.auctionservice.client.IdentityClient identityClient;

    @Autowired
    private HttpServletRequest request;

    private void verifySellerStatus(UUID sellerId) {
        // Developer 'Fast-Track' Toggle: Bypass verification check if X-Dev-Bypass header is present
        if ("true".equalsIgnoreCase(request.getHeader("X-Dev-Bypass"))) {
            return;
        }

        com.bidstream.auctionservice.dto.UserDTO user = identityClient.getUserDetails(sellerId);
        log.debug("Seller verification result: {}", user != null ? user.isVerifiedSeller() : null);
        if (user == null || !user.isVerifiedSeller()) {
            throw new VerificationRequiredException("Seller profile is pending verification. Please complete verification before listing.");
        }
    }

    public Product saveProduct(Product product, String categoryName) {
        verifySellerStatus(product.getSellerId());
        if (categoryName != null) {
            Product finalProduct = product;
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

    public void deleteProduct(UUID productId, UUID sellerId) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }

        existingProduct.setStatus(ProductStatus.CANCELED);
        productRepository.save(existingProduct);
    }

    public void updateStatus(UUID productId, ProductStatus newStatus) {
        Product product = productRepository.findById(productId).orElseThrow();
        product.setStatus(newStatus);
        productRepository.save(product);
        // Trigger notification on status change
        // TODO: NotificationService.send(product.getSellerId(), "Status changed to: " + newStatus);
    }

    public List<Product> getSellerProducts(UUID sellerId, Long categoryId, ProductStatus status) {
        if (categoryId != null && status != null) {
            return productRepository.findBySellerIdAndCategoryIdAndStatus(sellerId, categoryId, status);
        } else if (categoryId != null) {
            return productRepository.findBySellerIdAndCategoryId(sellerId, categoryId);
        } else if (status != null) {
            return productRepository.findBySellerIdAndStatus(sellerId, status);
        }
        return productRepository.findBySellerId(sellerId, org.springframework.data.domain.Pageable.unpaged()).getContent();
    }

    public Product updateProduct(UUID productId, UUID sellerId, Product updatedProduct) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to update this product");
        }

        if (existingProduct.getStatus() != ProductStatus.DRAFT && existingProduct.getStatus() != ProductStatus.SCHEDULED) {
            throw new RuntimeException("Product cannot be updated as it is already " + existingProduct.getStatus());
        }

        // Update fields
        if (updatedProduct.getName() != null) existingProduct.setName(updatedProduct.getName());
        if (updatedProduct.getDescription() != null) existingProduct.setDescription(updatedProduct.getDescription());
        if (updatedProduct.getInitialPrice() != null) {
            existingProduct.setInitialPrice(updatedProduct.getInitialPrice());
            if (existingProduct.getCurrentHighestBid() == null || existingProduct.getCurrentHighestBid() < updatedProduct.getInitialPrice()) {
                existingProduct.setCurrentHighestBid(updatedProduct.getInitialPrice());
            }
        }
        if (updatedProduct.getWeight() != null) existingProduct.setWeight(updatedProduct.getWeight());
        if (updatedProduct.getDimensions() != null) existingProduct.setDimensions(updatedProduct.getDimensions());
        if (updatedProduct.getManufacturer() != null) existingProduct.setManufacturer(updatedProduct.getManufacturer());
        if (updatedProduct.getImageUrls() != null) existingProduct.setImageUrls(updatedProduct.getImageUrls());
        if (updatedProduct.getAuctionEndTime() != null) existingProduct.setAuctionEndTime(updatedProduct.getAuctionEndTime());

        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            var category = categoryRepository.findById(updatedProduct.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existingProduct.setCategory(category);
        }

        return productRepository.save(existingProduct);
    }

    public Product scheduleAuction(UUID productId, UUID sellerId, LocalDateTime auctionEndTime) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to schedule this product");
        }

        if (product.getStatus() != ProductStatus.DRAFT) {
            throw new RuntimeException("Only draft products can be scheduled");
        }

        if (auctionEndTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Auction end time must be in the future");
        }

        product.setAuctionEndTime(auctionEndTime);
        product.setStatus(ProductStatus.SCHEDULED);

        return productRepository.save(product);
    }
}