package com.bidstream.identityservice.config;

import com.bidstream.identityservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final com.bidstream.identityservice.service.UserSessionService userSessionService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Guard Clause: If no Bearer token, move to the next filter immediately
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Safely extract the token and username
            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            // 3. Authenticate if the user is found and not already authenticated in this context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                java.util.UUID userId = jwtService.extractUserId(jwt);
                if (userId != null && !userSessionService.isSessionActive(userId, jwt)) {
                    log.warn("Session invalidated for user: {} (newer login on another device)", userEmail);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Session invalidated by a more recent login on another device\"}");
                    return;
                }

                // CRITICAL: Ensure your JwtService prepends "ROLE_" to your roles (e.g., ROLE_ADMIN)
                Collection<? extends GrantedAuthority> authorities = jwtService.extractAuthorities(jwt);

                if (jwtService.isTokenValid(jwt)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Authenticated user: {} with authorities: {}", userEmail, authorities);
                }
            }
        } catch (Exception e) {
            log.error("JWT Authentication failed: {}", e.getMessage());
            // Optional: You can send a 401 response here if the token is present but malformed
        }

        // 4. Always continue the filter chain
        filterChain.doFilter(request, response);
    }
}