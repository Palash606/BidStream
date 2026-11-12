package com.bidstream.auctionservice.client;

import com.bidstream.auctionservice.dto.UserDTO;
import com.bidstream.auctionservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "identity-service", configuration = FeignConfig.class, fallbackFactory = IdentityClientFallback.class)
public interface IdentityClient {
    @GetMapping("/auth/user-details")
    UserDTO getUserDetails(@RequestParam UUID userId);
}