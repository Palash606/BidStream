package com.bidstream.apigateway;

import com.bidstream.apigateway.config.RateLimiterConfig;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimiterConfigTest {

    private final RateLimiterConfig config = new RateLimiterConfig();

    @Test
    void testUserKeyResolver_WithUserIdHeader() {
        KeyResolver resolver = config.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/bids/place")
                .header("X-User-Id", "user-12345")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        String key = resolver.resolve(exchange).block();
        assertEquals("user-12345", key);
    }

    @Test
    void testUserKeyResolver_WithBearerToken() {
        KeyResolver resolver = config.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/bids/place")
                .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.test")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        String key = resolver.resolve(exchange).block();
        assertNotNull(key);
        assertTrue(key.startsWith("token:"));
    }

    @Test
    void testIpKeyResolver_WithForwardedFor() {
        KeyResolver resolver = config.ipKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/auth/login")
                .header("X-Forwarded-For", "203.0.113.195, 70.41.3.18")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        String key = resolver.resolve(exchange).block();
        assertEquals("203.0.113.195", key);
    }

    @Test
    void testRateLimitersInstantiated() {
        RedisRateLimiter bidLimiter = config.bidRateLimiter();
        RedisRateLimiter authLimiter = config.authRateLimiter();
        RedisRateLimiter defaultLimiter = config.defaultRateLimiter();

        assertNotNull(bidLimiter);
        assertNotNull(authLimiter);
        assertNotNull(defaultLimiter);
    }
}
