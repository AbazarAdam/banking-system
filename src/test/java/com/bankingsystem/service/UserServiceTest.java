package com.bankingsystem.service;

import com.bankingsystem.exception.UserNotFoundException;
import com.bankingsystem.model.User;
import com.bankingsystem.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;

    @Test
    void getUserByIdReturnsUser() {
        User user = new User();
        user.setId(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        assertSame(user, userService.getUserById("7"));
    }

    @Test
    void getUserByIdThrowsWhenMissing() {
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById("7"));
    }

    @Test
    void getUserByIdRejectsNonNumericId() {
        assertThrows(NumberFormatException.class, () -> userService.getUserById("not-a-number"));
        verifyNoInteractions(userRepository);
    }
}
