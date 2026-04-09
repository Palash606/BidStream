package com.bidstream.auctionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String username;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    @com.fasterxml.jackson.annotation.JsonProperty("isVerifiedSeller")
    private boolean verifiedSeller;
}