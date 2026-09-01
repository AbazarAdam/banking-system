package com.bankingsystem.service;

import com.bankingsystem.exception.InsufficientBalanceException;
import com.bankingsystem.model.Account;
import com.bankingsystem.model.AccountType;
import com.bankingsystem.repository.AccountRepository;
import com.bankingsystem.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private Authentication authentication;
    @InjectMocks private AccountService accountService;
    private Account account;

    @BeforeEach
    void setUp() {
        account = new Account();
        account.setId(1L);
        account.setUserId(10L);
        account.setAccountNumber("account-uuid");
        account.setAccountType(AccountType.SAVINGS);
        account.setBalance(100.0);
    }

    @Test
    void createAccountStartsWithZeroBalance() {
        when(accountRepository.save(account)).thenReturn(account);

        Account result = accountService.createAccount(account);

        assertSame(account, result);
        assertEquals(0.0, result.getBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void depositUpdatesBalanceByNumericId() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(account)).thenReturn(account);

        Account result = accountService.deposit("1", 25.0);

        assertEquals(125.0, result.getBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void depositResolvesUuidAccountNumber() {
        when(accountRepository.findByAccountNumber("account-uuid")).thenReturn(Optional.of(account));
        when(accountRepository.save(account)).thenReturn(account);

        accountService.deposit("account-uuid", 25.0);

        assertEquals(125.0, account.getBalance());
        verify(accountRepository).findByAccountNumber("account-uuid");
    }

    @Test
    void withdrawRejectsInsufficientBalance() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(InsufficientBalanceException.class,
                () -> accountService.withdraw("1", 101.0));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void frozenAccountCannotDeposit() {
        account.setFrozen(true);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(IllegalStateException.class, () -> accountService.deposit("1", 10.0));
    }

    @Test
    void transferDebitsAndCreditsBothAccounts() {
        Account recipient = new Account();
        recipient.setId(2L);
        recipient.setUserId(20L);
        recipient.setBalance(50.0);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.findByAccountNumber("recipient-uuid")).thenReturn(Optional.of(recipient));
        when(authentication.getName()).thenReturn("10");

        accountService.transfer("1", "recipient-uuid", 40.0, authentication);

        assertEquals(60.0, account.getBalance());
        assertEquals(90.0, recipient.getBalance());
        verify(accountRepository).save(account);
        verify(accountRepository).save(recipient);
        verify(transactionRepository, times(2)).save(any());
    }

    @Test
    void transferRejectsSourceOwnedByAnotherUser() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account));
        when(authentication.getName()).thenReturn("99");

        assertThrows(AccessDeniedException.class,
                () -> accountService.transfer("1", "2", 10.0, authentication));
        verify(accountRepository, never()).save(any(Account.class));
    }
}
