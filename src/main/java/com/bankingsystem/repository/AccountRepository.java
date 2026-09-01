package com.bankingsystem.repository;

import com.bankingsystem.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
	Optional<Account> findFirstByUserIdOrderByIdAsc(Long userId);
	Optional<Account> findByAccountNumber(String accountNumber);
}
