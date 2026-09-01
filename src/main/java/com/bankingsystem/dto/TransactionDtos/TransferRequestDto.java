package com.bankingsystem.dto.TransactionDtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TransferRequestDto {
    @NotNull(message = "From account ID is required")
    private String fromAccountId;

    @NotNull(message = "To account ID is required")
    private String toAccountId;

    @Positive(message = "Amount must be greater than zero")
    private Double amount;
}
