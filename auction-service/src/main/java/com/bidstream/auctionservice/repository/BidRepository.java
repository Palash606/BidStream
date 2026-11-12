package com.bidstream.auctionservice.repository;

import com.bidstream.auctionservice.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProductIdOrderByAmountDesc(UUID productId);
    Optional<Bid> findFirstByProductIdOrderByAmountDesc(UUID productId);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Bid b WHERE b.productId IN :productIds AND b.bidTime >= :since ORDER BY b.bidTime ASC")
    List<Bid> findBidsForProductsSince(@org.springframework.data.repository.query.Param("productIds") List<UUID> productIds, @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Bid b WHERE b.productId IN :productIds")
    long countBidsForProducts(@org.springframework.data.repository.query.Param("productIds") List<UUID> productIds);
}