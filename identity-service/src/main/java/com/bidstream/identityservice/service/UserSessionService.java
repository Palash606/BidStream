package com.bidstream.identityservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class UserSessionService {

    private final StringRedisTemplate redisTemplate;
    public static final String SESSION_PREFIX = "session:";

    public UserSessionService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void registerSession(UUID userId, String token, Duration ttl) {
        if (userId == null || token == null) return;
        try {
            String hash = hashToken(token);
            redisTemplate.opsForValue().set(SESSION_PREFIX + userId, hash, ttl);
            log.info("Registered active session in Redis for user {}", userId);
        } catch (Exception e) {
            log.warn("Redis unavailable for session registration: {}", e.getMessage());
        }
    }

    public boolean isSessionActive(UUID userId, String token) {
        if (userId == null || token == null) return false;
        try {
            String activeHash = redisTemplate.opsForValue().get(SESSION_PREFIX + userId);
            // If key is not present, allow graceful fallback (e.g. freshly rebooted Redis)
            if (activeHash == null) {
                return true;
            }
            return activeHash.equals(hashToken(token));
        } catch (Exception e) {
            log.warn("Redis unavailable for session verification: {}", e.getMessage());
            return true; // Graceful degradation
        }
    }

    public void invalidateSession(UUID userId) {
        if (userId == null) return;
        try {
            redisTemplate.delete(SESSION_PREFIX + userId);
            log.info("Invalidated session for user {}", userId);
        } catch (Exception e) {
            log.warn("Redis unavailable for session invalidation: {}", e.getMessage());
        }
    }

    public static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
