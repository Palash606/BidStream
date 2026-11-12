package com.bidstream.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
public class BidVelocityAnalyticsFilter implements GlobalFilter, Ordered {

    private final ReactiveStringRedisTemplate redisTemplate;
    private static final DateTimeFormatter HOURLY_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHH");
    public static final String VELOCITY_PREFIX = "analytics:bids:velocity:";

    public BidVelocityAnalyticsFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        HttpMethod method = exchange.getRequest().getMethod();

        if (HttpMethod.POST.equals(method) && path.endsWith("/api/bids/place")) {
            try {
                String currentHour = ZonedDateTime.now(ZoneOffset.UTC).format(HOURLY_FORMATTER);
                String key = VELOCITY_PREFIX + currentHour;

                // Increment velocity counter asynchronously without blocking request flow
                redisTemplate.opsForValue().increment(key)
                        .flatMap(count -> {
                            if (count != null && count == 1) {
                                return redisTemplate.expire(key, Duration.ofDays(30));
                            }
                            return Mono.just(true);
                        })
                        .doOnError(e -> log.warn("Failed to record bid velocity counter in Redis: {}", e.getMessage()))
                        .subscribe();
            } catch (Exception e) {
                log.warn("Redis velocity counter skipped: {}", e.getMessage());
            }
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
