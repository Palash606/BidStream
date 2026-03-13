package com.bidstream.identityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerVerificationRequest {
    private String email;
    private String aadharNumber;
    private String gstNumber;
    private String passportNumber;
    private String sellerType; // DOMESTIC or INTERNATIONAL
}
