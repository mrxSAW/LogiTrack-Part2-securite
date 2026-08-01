package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.auth.UserResponse;
import com.example.logitrackAPP.model.Role;
import com.example.logitrackAPP.model.User;
import com.example.logitrackAPP.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> afficherTous() {

        return userRepository.findAll()
                .stream()
                .map(this::convertirEnResponse)
                .toList();
    }

    private UserResponse convertirEnResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole()
        );
    }



    public UserResponse modifierRole(Long id, Role nouveauRole) {

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé")
        );

        if (nouveauRole == null) {throw new RuntimeException("Le rôle est obligatoire");}

        user.setRole(nouveauRole);

        User utilisateurModifie = userRepository.save(user);

        return convertirEnResponse(utilisateurModifie);
    }



    public void supprimer(Long id) {

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        userRepository.delete(user);
    }




}