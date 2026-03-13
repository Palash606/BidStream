package com.bidstream.identityservice.service;

import com.bidstream.identityservice.dto.SellerVerificationRequest;
import com.bidstream.identityservice.entity.SellerVerification;
import com.bidstream.identityservice.entity.User;
import com.bidstream.identityservice.repository.SellerVerificationRepository;
import com.bidstream.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class SellerVerificationService {

    @Autowired
    private SellerVerificationRepository verificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Map<String, Object> verifySeller(SellerVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SellerVerification verification = verificationRepository.findByUser(user)
                .orElse(new SellerVerification());

        verification.setUser(user);
        verification.setAadharNumber(request.getAadharNumber());
        verification.setGstNumber(request.getGstNumber());
        verification.setPassportNumber(request.getPassportNumber());
        verification.setSellerType(request.getSellerType());
        verification.setSubmittedAt(LocalDateTime.now());
        
        // Auto-approve for now as per demo requirements
        verification.setApproved(true);
        verification.setVerifiedAt(LocalDateTime.now());

        verificationRepository.save(verification);

        // Update User table boolean
        user.setVerifiedSeller(true);
        userRepository.save(user);

        return Map.of(
                "status", "SUCCESS",
                "message", "Seller verification completed successfully",
                "isVerifiedSeller", true
        );
    }

    public boolean isVerifiedSeller(String email) {
        return userRepository.findByEmail(email)
                .map(User::isVerifiedSeller)
                .orElse(false);
    }
}
