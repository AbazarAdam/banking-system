package com.bankingsystem.dto.AccountDtos;

import com.bankingsystem.model.AccountType;
import lombok.Data;

@Data
public class AccountResponseDto {
    private String accountId;
    private String accountNumber;
    private Double balance;
    private AccountType accountType;
}
