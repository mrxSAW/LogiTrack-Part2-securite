package com.example.logitrackAPP.dto.auth;

import com.example.logitrackAPP.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserResponse user;

}