package com.bidstream.auctionservice.repository;

import com.bidstream.auctionservice.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProductIdOrderByAmountDesc(UUID productId);
}