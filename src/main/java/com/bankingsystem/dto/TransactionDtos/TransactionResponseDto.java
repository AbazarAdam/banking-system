package com.bankingsystem.dto.TransactionDtos;

import com.bankingsystem.model.TransactionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionResponseDto {
    private String transactionId;
    private Double amount;
    private TransactionType transactionType;
    private LocalDateTime transactionDate;
}
