package com.bidstream.auctionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Starting bid is required")
    @Positive(message = "Starting bid must be positive")
    private Double initialPrice;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    private String weight;
    private String dimensions;
    private String manufacturer;
    
    @NotBlank(message = "Auction type is required")
    private String auctionType; // THREE_HAMMER or END_TIME
    
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private java.time.LocalDateTime auctionEndTime; // Required if END_TIME
}
