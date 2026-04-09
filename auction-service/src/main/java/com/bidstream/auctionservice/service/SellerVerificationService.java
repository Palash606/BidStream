package com.bidstream.auctionservice.service;

import com.bidstream.auctionservice.client.IdentityClient;
import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.exception.UnverifiedSellerException;
import feign.FeignException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SellerVerificationService {

    private final IdentityClient identityClient;
    private final HttpServletRequest httpRequest;

    /**
     * Verifies that the given sellerId has {@code isVerified = true} in the
     * identity-service. Throws {@link UnverifiedSellerException} if not.
     *
     * @param sellerId UUID of the authenticated seller
     * @throws UnverifiedSellerException if the seller is not verified
     * @throws feign.FeignException      if the identity-service is unreachable
     *                                   (propagated to GlobalExceptionHandler)
     */
    public void assertVerified(UUID sellerId) {
        // ── Developer bypass ──────────────────────────────────────────────────
        if ("true".equalsIgnoreCase(httpRequest.getHeader("X-Dev-Bypass"))) {
            log.warn("⚠ Seller verification bypassed via X-Dev-Bypass header for sellerId={}", sellerId);
            return;
        }

        // ── Remote verification via Feign ─────────────────────────────────────
        try {
            UserDTO user = identityClient.getUserDetails(sellerId);
            log.debug("Seller verification response for {}: isVerified={}", sellerId,
                    user != null ? user.isVerifiedSeller() : "null-response");

            if (user == null || !user.isVerifiedSeller()) {
                throw new UnverifiedSellerException(sellerId.toString());
            }
        } catch (UnverifiedSellerException e) {
            throw e; // re-throw our own domain exception
        } catch (FeignException.NotFound e) {
            // Seller doesn't exist in identity-service at all
            log.error("Seller {} not found in identity-service", sellerId);
            throw new UnverifiedSellerException(sellerId.toString(),
                    "Seller account not found. Please contact support.");
        } catch (FeignException e) {
            // identity-service is temporarily unavailable – fail safely (deny)
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
