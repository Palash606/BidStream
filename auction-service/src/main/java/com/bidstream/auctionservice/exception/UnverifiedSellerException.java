package com.bidstream.auctionservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnverifiedSellerException extends RuntimeException {

    private final String sellerId;

    public UnverifiedSellerException(String sellerId) {
        super("Seller account is not verified. Please complete your verification before listing products.");
        this.sellerId = sellerId;
    }

    public UnverifiedSellerException(String sellerId, String message) {
        super(message);
        this.sellerId = sellerId;
    }

    public String getSellerId() {
        return sellerId;
    }
}
