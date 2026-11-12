package com.bidstream.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Configuration
public class RateLimiterConfig {

    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (userId != null && !userId.isBlank()) {
                return Mono.just(userId);
            }
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return Mono.just("token:" + Math.abs(authHeader.hashCode()));
            }
            InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
            String ip = (remoteAddress != null && remoteAddress.getAddress() != null)
                    ? remoteAddress.getAddress().getHostAddress()
                    : "anonymous";
            return Mono.just("ip:" + ip);
        };
    }

    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return Mono.just(forwardedFor.split(",")[0].trim());
            }
            InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
            String ip = (remoteAddress != null && remoteAddress.getAddress() != null)
                    ? remoteAddress.getAddress().getHostAddress()
                    : "unknown-ip";
            return Mono.just(ip);
        };
    }

    @Bean
    public RedisRateLimiter bidRateLimiter() {
        // Replenish 10 bids/second with burst capacity of 20
        return new RedisRateLimiter(10, 20);
    }

    @Bean
    public RedisRateLimiter authRateLimiter() {
        // Replenish 10 auth requests/second with burst capacity of 20
        return new RedisRateLimiter(10, 20);
    }

    @Bean
    @Primary
    public RedisRateLimiter defaultRateLimiter() {
        // General catalog/api requests: 20 req/s, burst capacity 40
        return new RedisRateLimiter(20, 40);
    }
}
