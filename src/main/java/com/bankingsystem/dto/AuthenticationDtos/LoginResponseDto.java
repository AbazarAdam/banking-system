package com.bankingsystem.dto.AuthenticationDtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDto {
        private String token;
        private String userId;
        private String role;
}
