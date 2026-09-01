package com.bankingsystem.repository;

import com.bankingsystem.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.bankingsystem.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface TransactionRepository
                extends JpaRepository<Transaction, Long> {

        List<Transaction> findByAccountId(Long accountId);

    Page<Transaction> findByAccountIdAndTransactionType(
            Long accountId,
            TransactionType transactionType,
            Pageable pageable
    );
}

