package com.bidstream.auctionservice.exception;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UnverifiedSellerException.class)
    public ResponseEntity<Map<String, Object>> handleUnverifiedSeller(UnverifiedSellerException ex) {
        log.warn("Unverified seller action blocked: sellerId={}", ex.getSellerId());
        return errorResponse(
                HttpStatus.FORBIDDEN,
                "Seller Not Verified",
                "Seller account is not yet verified. Please complete your verification before listing products.",
                "SELLER_UNVERIFIED");
    }

    @ExceptionHandler(VerificationRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleVerificationRequired(VerificationRequiredException ex) {
        log.warn("Seller verification required: {}", ex.getMessage());
        return errorResponse(
                HttpStatus.FORBIDDEN,
                "Verification Required",
                "Your seller profile is not yet verified. Please complete verification in your dashboard before listing products.",
                "SELLER_UNVERIFIED");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        log.warn("Illegal state: {}", ex.getMessage());
        return errorResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), null);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return errorResponse(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage(), "NOT_FOUND");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("Upload size exceeded: {}", ex.getMessage());
        return errorResponse(
                HttpStatus.BAD_REQUEST,
                "Upload Too Large",
                "One or more files exceed the maximum allowed size. Please ensure each image is under 10 MB and the total upload is under 50 MB.",
                "UPLOAD_TOO_LARGE");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        // Keep the first error if a field has multiple violations
                        (existing, replacement) -> existing,
                        LinkedHashMap::new));

        log.debug("Validation failed: {}", fieldErrors);

        Map<String, Object> body = baseBody(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                "One or more fields are invalid. Please correct them and resubmit.",
                "VALIDATION_ERROR");
        body.put("fields", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException ex) {
        log.error("Downstream service call failed: status={} message={}", ex.status(), ex.getMessage());
        if (ex.status() == 401 || ex.status() == 403) {
            return errorResponse(HttpStatus.FORBIDDEN, "Forbidden", "Access denied by a downstream service.", null);
        }
        return errorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Service Temporarily Unavailable",
                "A required service is currently unreachable. Please try again shortly.",
                "DOWNSTREAM_ERROR");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Unhandled runtime exception", ex);
        return errorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected error occurred. Our team has been notified.",
                "INTERNAL_ERROR");
    }

    // ── Builder helpers ───────────────────────────────────────────────────────

    /**
     * Constructs the standard error envelope shared by all handlers.
     *
     * @param status  HTTP status to set on both the envelope and the response
     * @param error   Short human-readable error title (e.g. "Seller Not Verified")
     * @param message Detailed explanation for display in the UI
     * @param code    Machine-readable code the frontend can switch on (nullable)
     */
    private ResponseEntity<Map<String, Object>> errorResponse(
            HttpStatus status, String error, String message, String code) {
        return ResponseEntity.status(status).body(baseBody(status, error, message, code));
    }

    private Map<String, Object> baseBody(HttpStatus status, String error, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString()); // ISO-8601 UTC e.g. "2026-04-10T00:00:00Z"
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        if (code != null) {
            body.put("code", code);
        }
        return body;
    }
}
