package com.bankingsystem.controller;

import com.bankingsystem.dto.TransactionDtos.TransactionAnalyticsDto;
import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Core APIs
    @GetMapping("/account/{accountId}")
    public List<Transaction> getByAccount(
            @PathVariable String accountId
    ) {
        return transactionService.getTransactionsByAccountId(accountId);
    }

    // Advanced APIs
    @GetMapping("/filter")
    public Page<Transaction> filter(
            @RequestParam String accountId,
            @RequestParam TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy
    ) {
        return transactionService.filterTransactions(
                accountId, type, page, size, sortBy
        );
    }

    @GetMapping("/analytics/{accountId}")
    public TransactionAnalyticsDto analytics(
            @PathVariable String accountId
    ) {
        return transactionService.getAnalytics(accountId);
    }
}