package com.bidstream.auctionservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApplicationConfig {

    // Useful if you need to make quick REST calls to other services
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}