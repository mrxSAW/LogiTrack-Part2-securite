package com.example.logitrackAPP.config;

import com.example.logitrackAPP.model.Role;
import com.example.logitrackAPP.model.User;
import com.example.logitrackAPP.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner creerAdministrateur(UserRepository userRepository, PasswordEncoder passwordEncoder) {

        return args -> {

            String emailAdmin = "admin@logitrack.com";


            if (!userRepository.existsByEmail(emailAdmin)) {

                User admin = new User();

                admin.setNom("Admin");
                admin.setPrenom("LogiTrack");
                admin.setEmail(emailAdmin);


                admin.setPassword(
                        passwordEncoder.encode("1234")
                );

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "Administrateur créé : " + emailAdmin
                );
            }
        };
    }
}