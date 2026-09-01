package com.bankingsystem.dto;

import com.bankingsystem.model.Role;
import com.bankingsystem.model.TransactionType;
import java.time.LocalDateTime;
import java.util.List;

public final class AdminDtos {
    private AdminDtos() { }

    public record RoleRequest(Role role) { }
    public record LockRequest(boolean locked) { }
    public record ResetPinRequest(String pin) { }
    public record BalanceRequest(Double amount, String description) { }
    public record FreezeRequest(boolean frozen) { }

    public record UserSummary(Long id, String name, String email, Role role,
                              boolean locked, Long createdBy) { }
    public record UserDetails(Long id, String name, String email, Role role,
                              boolean locked, Long createdBy, List<AccountSummary> accounts) { }
    public record AccountSummary(Long id, String accountNumber, Double balance,
                                 String accountType, Long userId, String ownerName,
                                 String ownerEmail, boolean frozen) { }
    public record TransactionSummary(Long id, Long accountId, Double amount,
                                     TransactionType transactionType,
                                     LocalDateTime transactionDate) { }
    public record Stats(long totalUsers, long totalAccounts, long totalTransactions,
                        double totalBalance, long lockedUsers, long frozenAccounts) { }
}
