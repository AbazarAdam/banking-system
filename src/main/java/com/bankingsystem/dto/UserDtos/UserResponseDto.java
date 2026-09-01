package com.bankingsystem.dto.UserDtos;

import lombok.Data;

@Data
public class UserResponseDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private boolean locked;
}
