package com.bankingsystem.dto.AccountDtos;

import com.bankingsystem.model.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequestDto {

    @NotNull(message = "Account type is required")
    private AccountType accountType;
}
