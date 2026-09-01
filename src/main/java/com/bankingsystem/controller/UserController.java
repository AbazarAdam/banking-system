package com.bankingsystem.controller;

import com.bankingsystem.dto.UserDtos.UserResponseDto;
import com.bankingsystem.model.User;
import com.bankingsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable String id) {

        User user = userService.getUserById(id);
        UserResponseDto dto = new UserResponseDto();
        dto.setId(String.valueOf(user.getId()));
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() == null ? null : user.getRole().name());
        dto.setLocked(user.isLocked());

        return ResponseEntity.ok(dto);
    }
}
