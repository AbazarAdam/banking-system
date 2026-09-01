package com.bankingsystem.service;

import com.bankingsystem.dto.AdminDtos;
import com.bankingsystem.model.Account;
import com.bankingsystem.model.AccountType;
import com.bankingsystem.model.Role;
import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.User;
import com.bankingsystem.repository.AccountRepository;
import com.bankingsystem.repository.TransactionRepository;
import com.bankingsystem.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private Authentication authentication;
    @InjectMocks private AdminService adminService;

    @Test
    void setLockedUpdatesUser() {
        User user = user(2L, Role.USER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(authentication.getName()).thenReturn("1");
        when(userRepository.save(user)).thenReturn(user);

        AdminDtos.UserSummary result = adminService.setLocked("2", true, authentication);

        assertTrue(result.locked());
        verify(userRepository).save(user);
    }

    @Test
    void updateRoleChangesRoleForSuperAdminActor() {
        User user = user(2L, Role.USER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(authentication.getName()).thenReturn("1");
        when(userRepository.save(user)).thenReturn(user);

        AdminDtos.UserSummary result = adminService.updateRole("2", Role.ADMIN, authentication);

        assertEquals(Role.ADMIN, result.role());
        assertEquals(1L, user.getCreatedBy());
    }

    @Test
    void updateRoleRejectsSelfChange() {
        User user = user(1L, Role.SUPER_ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(authentication.getName()).thenReturn("1");

        assertThrows(AccessDeniedException.class,
                () -> adminService.updateRole("1", Role.USER, authentication));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPinHashesProvidedPin() {
        User user = user(2L, Role.USER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("4321")).thenReturn("hashed-pin");
        when(userRepository.save(user)).thenReturn(user);

        assertEquals("4321", adminService.resetPin("2", "4321"));
        assertEquals("hashed-pin", user.getTransferPin());
    }

    @Test
    void setFrozenUpdatesAccount() {
        Account account = account(4L, 2L, 100.0);
        User owner = user(2L, Role.USER);
        when(accountRepository.findById(4L)).thenReturn(Optional.of(account));
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(accountRepository.save(account)).thenReturn(account);

        AdminDtos.AccountSummary result = adminService.setFrozen("4", true);

        assertTrue(result.frozen());
        verify(accountRepository).save(account);
    }

    @Test
    void addBalanceUpdatesAccountAndCreatesAdjustment() {
        Account account = account(4L, 2L, 100.0);
        User owner = user(2L, Role.USER);
        when(accountRepository.findById(4L)).thenReturn(Optional.of(account));
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(accountRepository.save(account)).thenReturn(account);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminDtos.AccountSummary result = adminService.addBalance("4", new AdminDtos.BalanceRequest(50.0, "Adjustment"));

        assertEquals(150.0, result.balance());
        verify(transactionRepository).save(argThat(transaction ->
                transaction.getAccountId().equals(4L)
                        && transaction.getAmount().equals(50.0)
                        && transaction.getTransactionType().name().equals("ADMIN_ADJUSTMENT")
                        && transaction.getTransactionDate() != null));
    }

    @Test
    void statsAggregatesSystemData() {
        when(userRepository.count()).thenReturn(3L);
        when(accountRepository.count()).thenReturn(2L);
        when(transactionRepository.count()).thenReturn(5L);
        when(userRepository.findAll()).thenReturn(List.of(user(1L, Role.ADMIN), lockedUser(2L)));
        when(accountRepository.findAll()).thenReturn(List.of(account(1L, 1L, 100.0), frozenAccount(2L, 2L)));

        AdminDtos.Stats result = adminService.stats();

        assertEquals(3L, result.totalUsers());
        assertEquals(2L, result.totalAccounts());
        assertEquals(5L, result.totalTransactions());
        assertEquals(100.0, result.totalBalance());
        assertEquals(1L, result.lockedUsers());
        assertEquals(1L, result.frozenAccounts());
    }

    private static User user(Long id, Role role) {
        User user = new User();
        user.setId(id);
        user.setName("User " + id);
        user.setEmail("user" + id + "@example.com");
        user.setRole(role);
        return user;
    }

    private static User lockedUser(Long id) {
        User user = user(id, Role.USER);
        user.setLocked(true);
        return user;
    }

    private static Account account(Long id, Long userId, Double balance) {
        Account account = new Account();
        account.setId(id);
        account.setUserId(userId);
        account.setAccountNumber("account-" + id);
        account.setAccountType(AccountType.SAVINGS);
        account.setBalance(balance);
        return account;
    }

    private static Account frozenAccount(Long id, Long userId) {
        Account account = account(id, userId, 0.0);
        account.setFrozen(true);
        return account;
    }
}
