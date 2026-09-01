package com.bankingsystem.service;

import com.bankingsystem.exception.UserNotFoundException;
import com.bankingsystem.model.User;
import com.bankingsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    public User getUserById(String userId) {
        return userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + userId));
    }
}
