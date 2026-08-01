package com.example.logitrackAPP.dto.auth;

import com.example.logitrackAPP.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModifierRoleRequest {

    @NotNull(message = "Le rôle est obligatoire")
    private Role role;
}