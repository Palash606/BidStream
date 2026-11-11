package com.bidstream.auctionservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidHistoryDTO {
    private Double amount;
    private String maskedName;      // e.g., p****h
    private String userColorHex;    // e.g., #FF5733
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bidTime;
    private boolean isHighest;
}