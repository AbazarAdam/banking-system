package com.bankingsystem.service;

import com.bankingsystem.exception.AccountNotFoundException;
import com.bankingsystem.exception.InsufficientBalanceException;
import com.bankingsystem.model.Account;
import com.bankingsystem.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.repository.TransactionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private TransactionRepository transactionRepository;

    public Account createAccount(Account account) {
        account.setBalance(0.0);
        return accountRepository.save(account);
    }

    public Optional<Account> getFirstAccountByUserId(String userId) {
        return accountRepository.findFirstByUserIdOrderByIdAsc(Long.valueOf(userId));
    }
    public Double getBalance(String accountId) {
        return getAccountById(accountId).getBalance();
    }

    public Account deposit(String accountId, Double amount) {
        Account account = getAccountByReference(accountId);
        ensureNotFrozen(account);
        account.setBalance(account.getBalance() + amount);
        return accountRepository.save(account);
    }

    public Account withdraw(String accountId, Double amount) {
        Account account = getAccountByReference(accountId);
        ensureNotFrozen(account);

        if (account.getBalance() < amount) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        account.setBalance(account.getBalance() - amount);
        return accountRepository.save(account);
    }
    @Cacheable(value = "accounts", key = "#accountId")
    public Account getAccountById(String accountId) {
        return getAccountByReference(accountId);
    }

    public Account getAccountByReference(String reference) {
        try {
            return accountRepository.findById(Long.valueOf(reference))
                    .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        } catch (NumberFormatException exception) {
            return accountRepository.findByAccountNumber(reference)
                    .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        }
    }

    @Transactional
    public void transfer(String fromReference, String toReference, Double amount, Authentication authentication) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        Account from = getAccountByReference(fromReference);
        Account to = getAccountByReference(toReference);
        if (!from.getUserId().equals(Long.valueOf(authentication.getName()))) {
            throw new AccessDeniedException("You can only transfer from your own account");
        }
        ensureNotFrozen(from);
        ensureNotFrozen(to);
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
        if ((from.getBalance() == null ? 0 : from.getBalance()) < amount) {
            throw new InsufficientBalanceException("Insufficient balance");
        }
        from.setBalance(from.getBalance() - amount);
        to.setBalance((to.getBalance() == null ? 0 : to.getBalance()) + amount);
        accountRepository.save(from);
        accountRepository.save(to);
        saveTransferTransaction(from.getId(), amount, TransactionType.DEBIT);
        saveTransferTransaction(to.getId(), amount, TransactionType.CREDIT);
    }

    private void saveTransferTransaction(Long accountId, Double amount, TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setAmount(amount);
        transaction.setTransactionType(type);
        transaction.setTransactionDate(java.time.LocalDateTime.now());
        transactionRepository.save(transaction);
    }
    @CacheEvict(value = "accounts", key = "#account.id")
    public Account save(Account account) {
        return accountRepository.save(account);
    }

    private void ensureNotFrozen(Account account) {
        if (account.isFrozen()) {
            throw new IllegalStateException("Account is frozen");
        }
    }
}
