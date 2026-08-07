package com.example.logitrackAPP.service;

import com.example.logitrackAPP.Security.JwtService;
import com.example.logitrackAPP.dto.auth.AuthResponse;
import com.example.logitrackAPP.dto.auth.LoginRequest;
import com.example.logitrackAPP.dto.auth.RegisterRequest;
import com.example.logitrackAPP.dto.auth.UserResponse;
import com.example.logitrackAPP.model.Role;
import com.example.logitrackAPP.model.User;
import com.example.logitrackAPP.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void preparerTest() {

        authService = new AuthService( userRepository, passwordEncoder, jwtService);
    }

    @Test
    void inscriptionDoitCreerUnAgent() {

        RegisterRequest request = new RegisterRequest();

        request.setNom("Ahmed");
        request.setPrenom("Alaoui");
        request.setEmail("AHMED@TEST.COM");
        request.setPassword("Password123");

        when(userRepository.existsByEmail( "ahmed@test.com")).thenReturn(false);

        when(passwordEncoder.encode("Password123")).thenReturn("mot-de-passe-chiffre");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {

                    User user = invocation.getArgument(0);
                    user.setId(1L);

                    return user;
                });

        UserResponse resultat = authService.register(request);

        assertEquals(1L, resultat.getId());
        assertEquals(
                "ahmed@test.com",
                resultat.getEmail()
        );
        assertEquals(Role.AGENT, resultat.getRole());
    }

    @Test
    void inscriptionDoitRefuserEmailExistant() {

        RegisterRequest request = new RegisterRequest();

        request.setNom("Ahmed");
        request.setPrenom("Alaoui");
        request.setEmail("ahmed@test.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(
                "ahmed@test.com"
        )).thenReturn(true);

        ResponseStatusException exception = assertThrows( ResponseStatusException.class, () -> authService.register(request));

        assertEquals(
                409,
                exception.getStatusCode().value()
        );
    }

    @Test
    void connexionDoitRetournerLeJwt() {

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@test.com");
        request.setPassword("Password123");

        User user = new User();
        user.setId(1L);
        user.setNom("Admin");
        user.setPrenom("LogiTrack");
        user.setEmail("admin@test.com");
        user.setPassword("mot-de-passe-chiffre");
        user.setRole(Role.ADMIN);

        when(userRepository.findByEmail( "admin@test.com" )).thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "Password123",
                "mot-de-passe-chiffre"
        )).thenReturn(true);

        when(jwtService.generateToken(user)).thenReturn("jwt-test");

        AuthResponse resultat = authService.login(request);

        assertEquals(
                "jwt-test",
                resultat.getToken()
        );

        assertEquals( Role.ADMIN, resultat.getUser().getRole());
    }

    @Test
    void connexionDoitRefuserMauvaisMotDePasse() {

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@test.com");
        request.setPassword("incorrect");

        User user = new User();
        user.setEmail("admin@test.com");
        user.setPassword("mot-de-passe-chiffre");
        user.setRole(Role.ADMIN);

        when(userRepository.findByEmail( "admin@test.com" )).thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "incorrect",
                "mot-de-passe-chiffre"
        )).thenReturn(false);

        ResponseStatusException exception = assertThrows( ResponseStatusException.class, () -> authService.login(request) );

        assertEquals(
                401,
                exception.getStatusCode().value()
        );
    }



}