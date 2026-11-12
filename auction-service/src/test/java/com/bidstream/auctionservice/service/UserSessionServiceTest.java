package com.bidstream.auctionservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSessionServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private UserSessionService userSessionService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        userSessionService = new UserSessionService(redisTemplate);
    }

    @Test
    void testRegisterSession_Success() {
        UUID userId = UUID.randomUUID();
        String token = "sample.jwt.token";

        userSessionService.registerSession(userId, token, Duration.ofMinutes(60));

        verify(valueOperations).set(
                eq(UserSessionService.SESSION_PREFIX + userId),
                eq(UserSessionService.hashToken(token)),
                eq(Duration.ofMinutes(60))
        );
    }

    @Test
    void testIsSessionActive_MatchingToken_ReturnsTrue() {
        UUID userId = UUID.randomUUID();
        String token = "sample.jwt.token";
        String expectedHash = UserSessionService.hashToken(token);

        when(valueOperations.get(UserSessionService.SESSION_PREFIX + userId)).thenReturn(expectedHash);

        assertTrue(userSessionService.isSessionActive(userId, token));
    }

    @Test
    void testIsSessionActive_MismatchedToken_ReturnsFalse() {
        UUID userId = UUID.randomUUID();
        String tokenA = "device.a.token";
        String tokenB = "device.b.token";
        String hashB = UserSessionService.hashToken(tokenB);

        when(valueOperations.get(UserSessionService.SESSION_PREFIX + userId)).thenReturn(hashB);

        assertFalse(userSessionService.isSessionActive(userId, tokenA));
    }

    @Test
    void testIsSessionActive_RedisUnavailable_GracefulFallback_ReturnsTrue() {
        UUID userId = UUID.randomUUID();
        String token = "sample.jwt.token";

        when(valueOperations.get(anyString())).thenThrow(new RuntimeException("Redis connection refused"));

        assertTrue(userSessionService.isSessionActive(userId, token));
    }

    @Test
    void testInvalidateSession_DeletesKey() {
        UUID userId = UUID.randomUUID();

        userSessionService.invalidateSession(userId);

        verify(redisTemplate).delete(UserSessionService.SESSION_PREFIX + userId);
    }
}
