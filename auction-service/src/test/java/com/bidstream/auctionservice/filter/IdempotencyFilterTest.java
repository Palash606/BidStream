package com.bidstream.auctionservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("IdempotencyFilter — Distributed Bid Dedup Tests")
class IdempotencyFilterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private IdempotencyFilter idempotencyFilter;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("Request without X-Idempotency-Key passes through filter chain")
    void testPassThrough_WhenHeaderMissing() throws Exception {
        when(request.getHeader("X-Idempotency-Key")).thenReturn(null);

        idempotencyFilter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verifyNoInteractions(valueOperations);
    }

    @Test
    @DisplayName("Request with blank X-Idempotency-Key passes through filter chain")
    void testPassThrough_WhenHeaderBlank() throws Exception {
        when(request.getHeader("X-Idempotency-Key")).thenReturn("   ");

        idempotencyFilter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verifyNoInteractions(valueOperations);
    }

    @Test
    @DisplayName("New idempotency key is cached in Redis with 60s TTL and proceeds")
    void testNewKey_StoredInRedisAndProceeds() throws Exception {
        String key = UUID.randomUUID().toString();
        when(request.getHeader("X-Idempotency-Key")).thenReturn(key);
        when(valueOperations.get("idempotency:" + key)).thenReturn(null);

        idempotencyFilter.doFilter(request, response, filterChain);

        verify(valueOperations, times(1)).set("idempotency:" + key, "processed", 60, TimeUnit.SECONDS);
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Duplicate idempotency key returns 409 Conflict without invoking chain")
    void testDuplicateKey_Returns409Conflict() throws Exception {
        String key = UUID.randomUUID().toString();
        when(request.getHeader("X-Idempotency-Key")).thenReturn(key);
        when(valueOperations.get("idempotency:" + key)).thenReturn("processed");

        StringWriter responseBody = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseBody));

        idempotencyFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_CONFLICT);
        verify(response).setContentType("application/json");
        verify(filterChain, never()).doFilter(request, response);
        assertTrue(responseBody.toString().contains("Duplicate bid — idempotency key already processed"));
    }
}
