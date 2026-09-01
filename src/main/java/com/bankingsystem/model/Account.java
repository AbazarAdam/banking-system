package com.bankingsystem.model;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String accountNumber;
    private Double balance;
    @Enumerated(EnumType.STRING)
    private AccountType accountType;
    private Long userId;
    @Column(nullable = false)
    private boolean frozen = false;
}
