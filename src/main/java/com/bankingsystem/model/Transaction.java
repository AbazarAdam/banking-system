package com.bankingsystem.model;

import lombok.Data;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;

    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(32)")
    private TransactionType transactionType;

    private LocalDateTime transactionDate;
}
