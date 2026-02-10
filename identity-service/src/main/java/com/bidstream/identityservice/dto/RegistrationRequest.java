package com.bidstream.identityservice.dto;

import jakarta.validation.constraints.*;

public record RegistrationRequest(
        @NotBlank String username,

        @NotBlank
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        )
        String password,

        @NotBlank String confirmPassword,
        @NotBlank String firstName,
        @NotBlank String lastName,

        @NotBlank
        @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]{1}", message = "Invalid PAN format (e.g., ABCDE1234F)")
        String panCard,

        @NotBlank String countryCode,
        @NotBlank String phoneNumber,
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String zipCode,
        @NotBlank String country
) {
}