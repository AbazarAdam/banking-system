package com.bankingsystem.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "test-secret-with-at-least-32-characters");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86_400_000L);
    }

    @Test
    void generateTokenContainsUserIdAndRole() {
        String token = jwtUtil.generateToken("7", "ADMIN");

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("7", jwtUtil.extractUserId(token));
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void extractClaimsRejectsTamperedToken() {
        String token = jwtUtil.generateToken("7", "USER");

        assertFalse(jwtUtil.isTokenValid(token + "tampered"));
        assertThrows(Exception.class, () -> jwtUtil.extractClaims(token + "tampered"));
    }
}
