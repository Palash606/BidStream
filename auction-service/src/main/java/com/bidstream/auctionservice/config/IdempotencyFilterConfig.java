package com.bidstream.auctionservice.config;

import com.bidstream.auctionservice.filter.IdempotencyFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;

@Configuration
public class IdempotencyFilterConfig {

    @Bean
    public FilterRegistrationBean<IdempotencyFilter> idempotencyFilter(StringRedisTemplate redisTemplate) {
        FilterRegistrationBean<IdempotencyFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new IdempotencyFilter(redisTemplate));
        registration.setUrlPatterns(List.of("/api/bids/place"));
        registration.setOrder(1);
        return registration;
    }
}
