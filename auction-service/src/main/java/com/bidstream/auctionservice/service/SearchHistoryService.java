package com.bidstream.auctionservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SearchHistoryService {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    private static final String HISTORY_KEY = "SEARCH_HISTORY:";

    public void saveSearch(UUID userId, String query) {
        String key = HISTORY_KEY + userId;
        // Remove existing to avoid duplicates, then push to front
        redisTemplate.opsForList().remove(key, 1, query);
        redisTemplate.opsForList().leftPush(key, query);
        // Keep only the last 3
        redisTemplate.opsForList().trim(key, 0, 2);
    }

    public List<String> getRecentSearches(UUID userId) {
        return redisTemplate.opsForList().range(HISTORY_KEY + userId, 0, 2);
    }

    public void clearSearch(UUID userId, String query) {
        redisTemplate.opsForList().remove(HISTORY_KEY + userId, 1, query);
    }
}