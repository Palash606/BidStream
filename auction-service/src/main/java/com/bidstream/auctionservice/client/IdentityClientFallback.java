package com.bidstream.auctionservice.client;

import com.bidstream.auctionservice.dto.UserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class IdentityClientFallback implements FallbackFactory<IdentityClient> {

    @Override
    public IdentityClient create(Throwable cause) {
        return userId -> {
            log.warn("IdentityClient fallback triggered for userId={}: {}", userId, cause.getMessage());
            return null; // graceful null — callers already null-check
        };
    }
}
