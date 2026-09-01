package com.bankingsystem.dto.TransactionDtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TransactionRequestDto {
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    @NotNull(message = "Account ID is required")
    private String accountId;
}
