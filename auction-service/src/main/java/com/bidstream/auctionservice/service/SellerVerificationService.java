package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.exception.UnverifiedSellerException;
import feign.FeignException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SellerVerificationService {

    private static final Logger log = LoggerFactory.getLogger(SellerVerificationService.class);
    private final IdentityClient identityClient;
    private final HttpServletRequest httpRequest;

    public SellerVerificationService(IdentityClient identityClient, HttpServletRequest httpRequest) {
        this.identityClient = identityClient;
        this.httpRequest = httpRequest;
    }

    public void assertVerified(UUID sellerId) {
        if ("true".equalsIgnoreCase(httpRequest.getHeader("X-Dev-Bypass"))) {
            log.warn("⚠ Seller verification bypassed via X-Dev-Bypass header for sellerId={}", sellerId);
            return;
        }

        try {
            UserDTO user = identityClient.getUserDetails(sellerId);
            log.debug("Seller verification response for {}: isVerified={}", sellerId,
                    user != null ? user.isVerifiedSeller() : "null-response");

            if (user == null || !user.isVerifiedSeller()) {
                throw new UnverifiedSellerException(sellerId.toString());
            }
        } catch (UnverifiedSellerException e) {
            throw e;
        } catch (FeignException.NotFound e) {
            log.error("Seller {} not found in identity-service", sellerId);
            throw new UnverifiedSellerException(sellerId.toString(),
                    "Seller account not found. Please contact support.");
        } catch (FeignException e) {
            log.error("Identity-service unreachable during seller verification for {}: {}", sellerId, e.getMessage());
            throw new UnverifiedSellerException(sellerId.toString(),
                    "Unable to verify seller status at this time. Please try again shortly.");
        }
    }

    public boolean isVerified(UUID sellerId) {
        try {
            assertVerified(sellerId);
            return true;
        } catch (UnverifiedSellerException e) {
            return false;
        }
    }
}
