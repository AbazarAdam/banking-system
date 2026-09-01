package com.bankingsystem.service;

import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.repository.TransactionRepository;
import com.bankingsystem.repository.AccountRepository;
import com.bankingsystem.exception.AccountNotFoundException;
import com.bankingsystem.dto.TransactionDtos.TransactionAnalyticsDto;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
        private final AccountRepository accountRepository;

        public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
                this.accountRepository = accountRepository;
    }

    // ===== Core Logic =====

    public Transaction saveTransaction(
            Double amount,
            TransactionType type,
            String accountId
    ) {

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setTransactionType(type);
        transaction.setAccountId(resolveAccountId(accountId));
        transaction.setTransactionDate(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByAccountId(String accountId) {
                return transactionRepository.findByAccountId(resolveAccountId(accountId));
    }

    // ===== Advanced Features =====

    public Page<Transaction> filterTransactions(
            String accountId,
            TransactionType type,
            int page,
            int size,
            String sortBy
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortBy).descending()
        );

        return transactionRepository
                .findByAccountIdAndTransactionType(resolveAccountId(accountId), type, pageable);
    }

    public TransactionAnalyticsDto getAnalytics(String accountId) {

        List<Transaction> transactions =
                transactionRepository.findByAccountId(resolveAccountId(accountId));

        double credit = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.CREDIT)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double debit = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.DEBIT)
                .mapToDouble(Transaction::getAmount)
                .sum();

        return new TransactionAnalyticsDto(
                transactions.size(),
                credit,
                debit
        );
    }

        private Long resolveAccountId(String reference) {
                try {
                        return accountRepository.findById(Long.valueOf(reference))
                                        .orElseThrow(() -> new AccountNotFoundException("Account not found")).getId();
                } catch (NumberFormatException exception) {
                        return accountRepository.findByAccountNumber(reference)
                                        .orElseThrow(() -> new AccountNotFoundException("Account not found")).getId();
                }
        }
}