package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.dto.auth.ModifierRoleRequest;
import com.example.logitrackAPP.dto.auth.UserResponse;
import com.example.logitrackAPP.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> afficherTous() {
        return userService.afficherTous();
    }


    @PutMapping("/{id}/role")
    public UserResponse modifierRole(@PathVariable Long id, @Valid @RequestBody ModifierRoleRequest request) {
        return userService.modifierRole(id, request.getRole());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {

        userService.supprimer(id);

        return ResponseEntity.noContent().build();
    }



}