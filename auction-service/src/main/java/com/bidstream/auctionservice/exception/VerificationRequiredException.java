package com.bidstream.auctionservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class VerificationRequiredException extends RuntimeException {
    public VerificationRequiredException(String message) {
        super(message);
    }
}
