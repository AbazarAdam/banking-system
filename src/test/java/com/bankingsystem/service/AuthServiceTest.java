package com.bankingsystem.service;

import com.bankingsystem.exception.InvalidCredentialsException;
import com.bankingsystem.model.Role;
import com.bankingsystem.model.User;
import com.bankingsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private AuthService authService;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("encoded-password");
        user.setRole(Role.USER);
    }

    @Test
    void registerHashesPasswordAssignsUserRoleAndSaves() {
        user.setPassword("plain-password");
        when(passwordEncoder.encode("plain-password")).thenReturn("encoded-password");
        when(userRepository.save(user)).thenReturn(user);

        User result = authService.register(user);

        assertSame(user, result);
        assertEquals("encoded-password", result.getPassword());
        assertEquals(Role.USER, result.getRole());
        verify(userRepository).save(user);
    }

    @Test
    void loginReturnsUserForValidCredentials() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", user.getPassword())).thenReturn(true);

        assertSame(user, authService.login(user.getEmail(), "password"));
    }

    @Test
    void loginRejectsUnknownUser() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login("missing@example.com", "password"));
    }

    @Test
    void loginRejectsWrongPassword() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login(user.getEmail(), "wrong"));
    }

    @Test
    void loginRejectsLockedUserBeforeCheckingPassword() {
        user.setLocked(true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login(user.getEmail(), "password"));
        verifyNoInteractions(passwordEncoder);
    }
}
