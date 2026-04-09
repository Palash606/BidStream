import com.bidstream.auctionservice.dto.ProductRequest;
import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import com.bidstream.auctionservice.repository.ProductRepository;
import com.bidstream.auctionservice.service.ImageStorageService;
import com.bidstream.auctionservice.service.JwtService;
import com.bidstream.auctionservice.service.ProductSearchService;
import com.bidstream.auctionservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

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
    @Autowired
    private ImageStorageService imageStorageService;

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestPart("product") @jakarta.validation.Valid ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || authHeader.length() < 7) {
            throw new RuntimeException("Invalid Authorization header");
        }
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);

        Product product = new Product();
        product.setSellerId(sellerId);
        
        product.setStatus(switch (request.getAuctionType()) {
            case "THREE_HAMMER" -> ProductStatus.ACTIVE;
            case "END_TIME" -> ProductStatus.SCHEDULED;
            case null, default -> ProductStatus.DRAFT;
        });
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setInitialPrice(request.getInitialPrice());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setManufacturer(request.getManufacturer());
        product.setAuctionType(request.getAuctionType());
        product.setAuctionEndTime(request.getAuctionEndTime());

        if (images != null && !images.isEmpty()) {
            try {
                // Java 21 sequenced collection standard
                List<String> imageUrls = imageStorageService.saveImagesAsync(images).get();
                product.setImageUrls(imageUrls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images", e);
            }
        } else {
            product.setImageUrls(new ArrayList<>());
        }

        return ResponseEntity.ok(productService.saveProduct(product, request.getCategoryName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable UUID id,
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setInitialPrice(request.getInitialPrice());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setManufacturer(request.getManufacturer());
        product.setAuctionType(request.getAuctionType());
        product.setAuctionEndTime(request.getAuctionEndTime());
        // For existing updates, we usually need more fine-grained image handling, but keeping it simple:
        if (images != null && !images.isEmpty()) {
            try {
                List<String> imageUrls = imageStorageService.saveImagesAsync(images).get();
                product.setImageUrls(imageUrls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images", e);
            }
        }

        // ProductService needs to support handling category separately during update if we want to change it.
        // For simplicity we will assume `updateProduct` handles it if we set a placeholder category.
        return ResponseEntity.ok(productService.updateProduct(id, sellerId, product));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam ProductStatus status,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);
        // Authorization should ideally be checked here, but delegating to service or trusting client for now.
        // Let's add basic auth check if needed:
        Product p = productRepository.findById(id).orElseThrow();
        if(!p.getSellerId().equals(sellerId)) throw new RuntimeException("Unauthorized");
        
        productService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);
        
        productService.deleteProduct(id, sellerId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/seller")
    public ResponseEntity<List<Product>> getSellerProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);
        return ResponseEntity.ok(productService.getSellerProducts(sellerId, categoryId, status));
    }

    @GetMapping("/all")
    public ResponseEntity<org.springframework.data.domain.Page<Product>> getAllSellerProducts(
            @RequestHeader("Authorization") String authHeader,
            org.springframework.data.domain.Pageable pageable) {
        String token = authHeader.substring(7);
        UUID sellerId = jwtService.extractUserId(token);
        return ResponseEntity.ok(productRepository.findBySellerId(sellerId, pageable));
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
    public ResponseEntity<?> debugAuth(@RequestHeader("Authorization") String authHeader, org.springframework.security.core.Authentication authentication) {
        String token = authHeader.substring(7);
        var extracted = jwtService.extractAuthorities(token);
        return ResponseEntity.ok(java.util.Map.of(
                "springAuthorities", authentication != null ? authentication.getAuthorities().toString() : "NULL",
                "extractedFromToken", extracted.toString(),
                "isAuthenticated", authentication != null && authentication.isAuthenticated()
        ));
    }
}