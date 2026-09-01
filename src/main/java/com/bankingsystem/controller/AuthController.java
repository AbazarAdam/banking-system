package com.bankingsystem.controller;

import com.bankingsystem.dto.AuthenticationDtos.LoginRequestDto;
import com.bankingsystem.dto.AuthenticationDtos.LoginResponseDto;
import com.bankingsystem.dto.AuthenticationDtos.RegisterRequestDto;
import com.bankingsystem.model.User;
import com.bankingsystem.service.AuthService;
import com.bankingsystem.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequestDto dto) {

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        authService.register(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {

        User user = authService.login(dto.getEmail(), dto.getPassword());
        if (user.getRole() == null) {
            throw new com.bankingsystem.exception.InvalidCredentialsException("User role is not configured");
        }
        String role = user.getRole().name();
        String userId = String.valueOf(user.getId());
        String token = jwtUtil.generateToken(userId, role);

        return ResponseEntity.ok(
            new LoginResponseDto(token, userId, role)
        );
    }
}
