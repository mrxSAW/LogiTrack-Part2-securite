package com.example.logitrackAPP.dto.auth;

import com.example.logitrackAPP.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
}