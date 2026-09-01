package com.bankingsystem.controller;

import com.bankingsystem.dto.AccountDtos.AccountResponseDto;
import com.bankingsystem.dto.AccountDtos.BalanceResponseDto;
import com.bankingsystem.dto.AccountDtos.CreateAccountRequestDto;
import com.bankingsystem.dto.TransactionDtos.TransactionRequestDto;
import com.bankingsystem.dto.TransactionDtos.TransferRequestDto;
import com.bankingsystem.model.Account;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.service.AccountService;
import com.bankingsystem.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    private  AccountService accountService;
    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<AccountResponseDto> createAccount(
            @Valid @RequestBody CreateAccountRequestDto dto,
            @RequestParam String userId) {

        Account account = new Account();
        account.setAccountType(dto.getAccountType());
        account.setAccountNumber(UUID.randomUUID().toString());
        account.setUserId(Long.valueOf(userId));

        Account saved = accountService.createAccount(account);

        AccountResponseDto response = new AccountResponseDto();
        response.setAccountId(String.valueOf(saved.getId()));
        response.setAccountNumber(saved.getAccountNumber());
        response.setBalance(saved.getBalance());
        response.setAccountType(saved.getAccountType());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<AccountResponseDto> getAccountByUser(@PathVariable String userId) {
        Optional<Account> account = accountService.getFirstAccountByUserId(userId);
        return account.map(value -> {
            AccountResponseDto response = new AccountResponseDto();
            response.setAccountId(String.valueOf(value.getId()));
            response.setAccountNumber(value.getAccountNumber());
            response.setBalance(value.getBalance());
            response.setAccountType(value.getAccountType());
            return ResponseEntity.ok(response);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BalanceResponseDto> getBalance(@PathVariable String id) {
        return ResponseEntity.ok(
                new BalanceResponseDto(accountService.getBalance(id))
        );
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<String> deposit(
            @PathVariable String id,
            @Valid @RequestBody TransactionRequestDto dto) {

        accountService.deposit(id, dto.getAmount());
        transactionService.saveTransaction(
                dto.getAmount(),
                TransactionType.CREDIT,
                id
        );
        return ResponseEntity.ok("Amount deposited successfully");
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<String> withdraw(
            @PathVariable String id,
            @Valid @RequestBody TransactionRequestDto dto) {

        accountService.withdraw(id, dto.getAmount());
        transactionService.saveTransaction(
                dto.getAmount(),
                TransactionType.DEBIT,
                id
        );
        return ResponseEntity.ok("Amount withdrawn successfully");
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@Valid @RequestBody TransferRequestDto dto,
                                           Authentication authentication) {
        accountService.transfer(dto.getFromAccountId(), dto.getToAccountId(), dto.getAmount(), authentication);
        return ResponseEntity.ok("Transfer completed successfully");
    }
}
