package com.bidstream.auctionservice.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class IdempotencyFilter implements Filter {

    private final StringRedisTemplate redisTemplate;

    public IdempotencyFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String key = httpRequest.getHeader("X-Idempotency-Key");

        // If header is missing or blank, pass through — idempotency is optional
        if (key == null || key.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        String redisKey = "idempotency:" + key;
        String existing = redisTemplate.opsForValue().get(redisKey);

        if (existing != null) {
            // Duplicate — return 409 Conflict
            httpResponse.setStatus(HttpServletResponse.SC_CONFLICT);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\"error\":\"Duplicate bid — idempotency key already processed\",\"key\":\"" + key + "\"}"
            );
            return;
        }

        // Store key with 60-second TTL before passing through
        redisTemplate.opsForValue().set(redisKey, "processed", 60, TimeUnit.SECONDS);
        chain.doFilter(request, response);
    }
}
