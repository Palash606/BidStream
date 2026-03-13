package com.bidstream.identityservice.repository;

import com.bidstream.identityservice.entity.SellerVerification;
import com.bidstream.identityservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SellerVerificationRepository extends JpaRepository<SellerVerification, UUID> {
    Optional<SellerVerification> findByUser(User user);
    Optional<SellerVerification> findByUserEmail(String email);
}
