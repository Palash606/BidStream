package com.bidstream.auctionservice.repository;

import com.bidstream.auctionservice.entity.Product;
import com.bidstream.auctionservice.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findBySellerIdAndStatusNotIn(UUID sellerId, List<ProductStatus> statuses, Pageable pageable);

    List<Product> findBySellerIdAndCategoryIdAndStatusNotIn(UUID sellerId, Long categoryId, List<ProductStatus> statuses);

    Page<Product> findBySellerIdAndCategoryIdAndStatusNotIn(UUID sellerId, Long categoryId, List<ProductStatus> statuses, Pageable pageable);

    List<Product> findBySellerIdAndCategoryIdAndStatus(UUID sellerId, Long categoryId, ProductStatus status);

    Page<Product> findBySellerIdAndCategoryIdAndStatus(UUID sellerId, Long categoryId, ProductStatus status, Pageable pageable);

    List<Product> findBySellerIdAndStatus(UUID sellerId, ProductStatus status);

    Page<Product> findBySellerIdAndStatus(UUID sellerId, ProductStatus status, Pageable pageable);


    @Query("SELECT p FROM Product p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(p.status IN ('ACTIVE', 'SCHEDULED')) AND " + // Strict Visibility Rule
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR p.initialPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.initialPrice <= :maxPrice) AND " +
            "(:startDate IS NULL OR p.auctionEndTime >= :startDate) AND " +
            "(:endDate IS NULL OR p.auctionEndTime <= :endDate) " +
            "ORDER BY CASE " +
            "  WHEN LOWER(p.name) LIKE LOWER(CONCAT(:query, '%')) THEN 1 " +
            "  ELSE 2 END, p.name ASC")
    List<Product> searchVisibleProducts(@Param("query") String query,
                                        @Param("categoryId") Long categoryId,
                                        @Param("minPrice") Double minPrice,
                                        @Param("maxPrice") Double maxPrice,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    List<Product> findByWinnerIdAndStatusIn(UUID winnerId, List<ProductStatus> statuses);
    
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.auctionEndTime BETWEEN :now AND :soon ORDER BY p.auctionEndTime ASC")
    List<Product> findEndingSoon(@Param("now") LocalDateTime now, @Param("soon") LocalDateTime soon);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.category.name IN :categories")
    List<Product> findByCategoryNames(@Param("categories") List<String> categories);

    @Query("SELECT p FROM Product p WHERE p.auctionEndTime <= :now AND p.status = :status")
    List<Product> findExpiredActiveAuctions(
            @Param("now") LocalDateTime now,
            @Param("status") ProductStatus status);

    List<Product> findBySellerId(UUID sellerId);

    List<Product> findByStatus(ProductStatus productStatus);
//    // 1. Filter by category
//    List<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status);
//
//    // 2. Filter by price range
//    List<Product> findByInitialPriceBetweenAndStatus(Double min, Double max, ProductStatus status);
}
