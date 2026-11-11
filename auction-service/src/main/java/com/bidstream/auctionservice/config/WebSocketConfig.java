package com.bidstream.auctionservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topic prefix for broadcasting to subscribers (e.g. /topic/auction/{id})
        config.enableSimpleBroker("/topic");
        // Application prefix for messages handled by @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register raw STOMP endpoint
        registry.addEndpoint("/ws-auction")
                .setAllowedOriginPatterns("*");

        // Register SockJS fallback STOMP endpoint
        registry.addEndpoint("/ws-auction")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}

