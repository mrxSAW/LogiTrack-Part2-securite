package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.dto.auth.AuthResponse;
import com.example.logitrackAPP.dto.auth.LoginRequest;
import com.example.logitrackAPP.dto.auth.RegisterRequest;
import com.example.logitrackAPP.dto.auth.UserResponse;
import com.example.logitrackAPP.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }




    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}