package com.bankingsystem.dto.AccountDtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BalanceResponseDto {
    private Double balance;
}
