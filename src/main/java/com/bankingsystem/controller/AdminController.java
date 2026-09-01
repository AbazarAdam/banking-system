package com.bankingsystem.controller;

import com.bankingsystem.dto.AdminDtos;
import com.bankingsystem.model.TransactionType;
import com.bankingsystem.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping("/users")
    public Object users() { return adminService.users(); }

    @GetMapping("/users/{id}")
    public Object user(@PathVariable String id) { return adminService.user(id); }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Object role(@PathVariable String id, @Valid @RequestBody AdminDtos.RoleRequest request,
                       Authentication authentication) {
        return adminService.updateRole(id, request.role(), authentication);
    }

    @PutMapping("/users/{id}/lock")
    public Object lock(@PathVariable String id, @RequestBody AdminDtos.LockRequest request,
                       Authentication authentication) {
        return adminService.setLocked(id, request.locked(), authentication);
    }

    @PutMapping("/users/{id}/reset-pin")
    public ResponseEntity<Object> resetPin(@PathVariable String id, @RequestBody(required = false) AdminDtos.ResetPinRequest request) {
        return ResponseEntity.ok(adminService.resetPin(id, request == null ? null : request.pin()));
    }

    @GetMapping("/accounts")
    public Object accounts() { return adminService.accounts(); }

    @GetMapping("/accounts/{id}")
    public Object account(@PathVariable String id) { return adminService.account(id); }

    @PostMapping("/accounts/{id}/add-balance")
    public Object addBalance(@PathVariable String id, @RequestBody AdminDtos.BalanceRequest request) {
        return adminService.addBalance(id, request);
    }

    @PutMapping("/accounts/{id}/freeze")
    public Object freeze(@PathVariable String id, @RequestBody AdminDtos.FreezeRequest request) {
        return adminService.setFrozen(id, request.frozen());
    }

    @GetMapping("/transactions")
    public Object transactions(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) Long accountId,
                               @RequestParam(required = false) TransactionType type,
                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return adminService.transactions(userId, accountId, type, from, to);
    }

    @GetMapping("/transactions/{id}")
    public Object transaction(@PathVariable Long id) {
        return adminService.transaction(id);
    }

    @GetMapping("/stats")
    public AdminDtos.Stats stats() { return adminService.stats(); }
}
