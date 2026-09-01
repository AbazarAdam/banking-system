package com.bankingsystem.dto.TransactionDtos;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TransactionAnalyticsDto {

    private long totalTransactions;
    private double totalCredit;
    private double totalDebit;
}