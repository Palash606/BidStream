package com.bidstream.auctionservice.exception;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@lombok.extern.slf4j.Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException ex) {
        log.error("Feign error occurred", ex);
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        
        if (ex.status() == 403 || ex.status() == 401) {
            body.put("status", HttpStatus.FORBIDDEN.value());
            body.put("error", "Unauthorized or Forbidden Seller access.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
        }
        
        body.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        body.put("error", "External Service Dependency Failed");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(VerificationRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleVerificationRequiredException(VerificationRequiredException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Verification Required");
        body.put("message", "Your seller profile is not yet verified. Please complete verification in your dashboard before listing products.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
