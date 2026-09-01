package com.bankingsystem.service;

import com.bankingsystem.dto.AdminDtos;
import com.bankingsystem.exception.AccountNotFoundException;
import com.bankingsystem.exception.UserNotFoundException;
import com.bankingsystem.model.Account;
import com.bankingsystem.model.Role;
import com.bankingsystem.model.Transaction;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.model.User;
import com.bankingsystem.repository.AccountRepository;
import com.bankingsystem.repository.TransactionRepository;
import com.bankingsystem.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminService(UserRepository userRepository, AccountRepository accountRepository,
                        TransactionRepository transactionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminDtos.UserSummary> users() {
        return userRepository.findAll().stream().map(this::summary).toList();
    }

    public AdminDtos.UserDetails user(String id) {
        User user = findUser(id);
        List<AdminDtos.AccountSummary> accounts = accountRepository.findAll().stream()
                .filter(account -> user.getId().equals(account.getUserId()))
                .map(account -> accountSummary(account, user)).toList();
        return new AdminDtos.UserDetails(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isLocked(), user.getCreatedBy(), accounts);
    }

    @Transactional
    public AdminDtos.UserSummary updateRole(String id, Role role, Authentication authentication) {
        User target = findUser(id);
        long actorId = actorId(authentication);
        if (actorId == target.getId()) {
            throw new AccessDeniedException("You cannot change your own role");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }
        target.setRole(role);
        target.setCreatedBy(actorId);
        return summary(userRepository.save(target));
    }

    @Transactional
    public AdminDtos.UserSummary setLocked(String id, boolean locked, Authentication authentication) {
        User target = findUser(id);
        if (actorId(authentication) == target.getId()) {
            throw new AccessDeniedException("You cannot lock your own account");
        }
        target.setLocked(locked);
        return summary(userRepository.save(target));
    }

    @Transactional
    public String resetPin(String id, String requestedPin) {
        User target = findUser(id);
        String pin = requestedPin == null || requestedPin.isBlank()
                ? String.format("%04d", secureRandom.nextInt(10000)) : requestedPin;
        if (!pin.matches("\\d{4}")) {
            throw new IllegalArgumentException("Transfer PIN must contain exactly 4 digits");
        }
        target.setTransferPin(passwordEncoder.encode(pin));
        userRepository.save(target);
        return pin;
    }

    public List<AdminDtos.AccountSummary> accounts() {
        return accountRepository.findAll().stream().map(account -> accountSummary(account, findUserById(account.getUserId()))).toList();
    }

    public AdminDtos.AccountSummary account(String id) {
        Account account = findAccount(id);
        return accountSummary(account, findUserById(account.getUserId()));
    }

    @Transactional
    public AdminDtos.AccountSummary addBalance(String id, AdminDtos.BalanceRequest request) {
        if (request == null || request.amount() == null || request.amount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        Account account = findAccount(id);
        account.setBalance((account.getBalance() == null ? 0 : account.getBalance()) + request.amount());
        accountRepository.save(account);
        Transaction transaction = new Transaction();
        transaction.setAccountId(account.getId());
        transaction.setAmount(request.amount());
        transaction.setTransactionType(TransactionType.ADMIN_ADJUSTMENT);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);
        return accountSummary(account, findUserById(account.getUserId()));
    }

    @Transactional
    public AdminDtos.AccountSummary setFrozen(String id, boolean frozen) {
        Account account = findAccount(id);
        account.setFrozen(frozen);
        return accountSummary(accountRepository.save(account), findUserById(account.getUserId()));
    }

    public List<AdminDtos.TransactionSummary> transactions(Long userId, Long accountId, TransactionType type,
                                                            LocalDate from, LocalDate to) {
        List<Long> accountIds = accountRepository.findAll().stream()
                .filter(account -> userId == null || userId.equals(account.getUserId()))
                .map(Account::getId).toList();
        return transactionRepository.findAll().stream()
                .filter(transaction -> accountId == null ? accountIds.contains(transaction.getAccountId()) : accountId.equals(transaction.getAccountId()))
                .filter(transaction -> type == null || type == transaction.getTransactionType())
                .filter(transaction -> from == null || !transaction.getTransactionDate().isBefore(from.atStartOfDay()))
                .filter(transaction -> to == null || transaction.getTransactionDate().isBefore(to.plusDays(1).atStartOfDay()))
                .sorted(Comparator.comparing(Transaction::getTransactionDate).reversed())
                .map(transaction -> new AdminDtos.TransactionSummary(transaction.getId(), transaction.getAccountId(), transaction.getAmount(), transaction.getTransactionType(), transaction.getTransactionDate()))
                .toList();
    }

            public AdminDtos.TransactionSummary transaction(Long id) {
            Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
            return new AdminDtos.TransactionSummary(transaction.getId(), transaction.getAccountId(), transaction.getAmount(),
                transaction.getTransactionType(), transaction.getTransactionDate());
            }

    public AdminDtos.Stats stats() {
        return new AdminDtos.Stats(userRepository.count(), accountRepository.count(), transactionRepository.count(),
                accountRepository.findAll().stream().mapToDouble(account -> account.getBalance() == null ? 0 : account.getBalance()).sum(),
                userRepository.findAll().stream().filter(User::isLocked).count(),
                accountRepository.findAll().stream().filter(Account::isFrozen).count());
    }

    private AdminDtos.UserSummary summary(User user) {
        return new AdminDtos.UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isLocked(), user.getCreatedBy());
    }

    private AdminDtos.AccountSummary accountSummary(Account account, User owner) {
        return new AdminDtos.AccountSummary(account.getId(), account.getAccountNumber(), account.getBalance(),
                account.getAccountType() == null ? null : account.getAccountType().name(), account.getUserId(),
                owner == null ? null : owner.getName(), owner == null ? null : owner.getEmail(), account.isFrozen());
    }

    private User findUser(String id) {
        try { return userRepository.findById(Long.valueOf(id)).orElseThrow(() -> new UserNotFoundException("User not found")); }
        catch (NumberFormatException exception) { throw new UserNotFoundException("User not found"); }
    }

    private User findUserById(Long id) { return id == null ? null : userRepository.findById(id).orElse(null); }
    private Account findAccount(String id) {
        try { return accountRepository.findById(Long.valueOf(id)).orElseThrow(() -> new AccountNotFoundException("Account not found")); }
        catch (NumberFormatException exception) { throw new AccountNotFoundException("Account not found"); }
    }
    private long actorId(Authentication authentication) { return Long.parseLong(authentication.getName()); }
}
