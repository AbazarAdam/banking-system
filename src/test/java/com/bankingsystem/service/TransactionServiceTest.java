package com.bankingsystem.service;

import com.bankingsystem.dto.TransactionDtos.TransactionAnalyticsDto;
import com.bankingsystem.model.Account;
import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.repository.AccountRepository;
import com.bankingsystem.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {
    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @InjectMocks private TransactionService transactionService;

    @Test
    void getTransactionsResolvesAccountNumber() {
        Account account = account(3L, "uuid-3");
        List<Transaction> transactions = List.of(transaction(1L, 3L, 20.0, TransactionType.CREDIT));
        when(accountRepository.findByAccountNumber("uuid-3")).thenReturn(Optional.of(account));
        when(transactionRepository.findByAccountId(3L)).thenReturn(transactions);

        assertEquals(transactions, transactionService.getTransactionsByAccountId("uuid-3"));
    }

    @Test
    void getAnalyticsSumsCreditsAndDebits() {
        Account account = account(3L, "uuid-3");
        when(accountRepository.findById(3L)).thenReturn(Optional.of(account));
        when(transactionRepository.findByAccountId(3L)).thenReturn(List.of(
                transaction(1L, 3L, 100.0, TransactionType.CREDIT),
                transaction(2L, 3L, 35.0, TransactionType.DEBIT),
                transaction(3L, 3L, 20.0, TransactionType.CREDIT)));

        TransactionAnalyticsDto result = transactionService.getAnalytics("3");

        assertEquals(3, result.getTotalTransactions());
        assertEquals(120.0, result.getTotalCredit());
        assertEquals(35.0, result.getTotalDebit());
    }

    @Test
    void saveTransactionCreatesTimestampedTransaction() {
        Account account = account(3L, "uuid-3");
        when(accountRepository.findById(3L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction result = transactionService.saveTransaction(12.5, TransactionType.CREDIT, "3");

        assertEquals(3L, result.getAccountId());
        assertEquals(12.5, result.getAmount());
        assertEquals(TransactionType.CREDIT, result.getTransactionType());
        assertNotNull(result.getTransactionDate());
    }

    private static Account account(Long id, String number) {
        Account account = new Account();
        account.setId(id);
        account.setAccountNumber(number);
        return account;
    }

    private static Transaction transaction(Long id, Long accountId, Double amount, TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setAccountId(accountId);
        transaction.setAmount(amount);
        transaction.setTransactionType(type);
        transaction.setTransactionDate(LocalDateTime.now());
        return transaction;
    }
}
