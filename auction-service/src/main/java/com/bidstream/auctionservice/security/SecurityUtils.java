package com.bidstream.auctionservice.security;

import com.bidstream.auctionservice.service.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Utility bean for extracting authenticated user identity from the Spring Security context.
 *
 * The JWT filter (JwtAuthenticationFilter) populates the SecurityContext with:
 *   - principal = email (JWT subject)
 *   - details   = WebAuthenticationDetails (includes remote addr)
 *
 * Because the JWT filter does NOT store the UUID in the Authentication object directly
 * (it sets the email as principal), we keep the JwtService available here so that we
 * can re-parse the userId claim from the token when needed.
 *
 * Usage:
 *   UUID sellerId = securityUtils.getAuthenticatedUserId(authHeader);
 */
@Component
public class SecurityUtils {

    private final JwtService jwtService;

    public SecurityUtils(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Returns the authenticated user's email (the JWT subject / principal).
     * Throws IllegalStateException if the security context holds no authenticated user.
     */
    public String getAuthenticatedEmail() {
        Authentication auth = requireAuthentication();
        return (String) auth.getPrincipal();
    }

    /**
     * Extracts the seller UUID from the raw Bearer token.
     * Delegates to JwtService so the parsing logic lives in one place.
     *
     * @param bearerToken full "Bearer <jwt>" header value
     * @return the UUID of the authenticated user
     */
    public UUID getAuthenticatedUserId(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or malformed Authorization header");
        }
        return jwtService.extractUserId(bearerToken.substring(7));
    }

    /**
     * Convenience method when the controller still has the raw header available.
     * Equivalent to calling getAuthenticatedUserId(authHeader).
     */
    public UUID extractSellerIdFromHeader(String authorizationHeader) {
        return getAuthenticatedUserId(authorizationHeader);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Authentication requireAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found in security context");
        }
        return auth;
    }
}
