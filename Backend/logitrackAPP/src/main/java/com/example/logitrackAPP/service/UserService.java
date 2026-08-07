package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.auth.UserResponse;
import com.example.logitrackAPP.exception.BusinessException;
import com.example.logitrackAPP.exception.ResourceNotFoundException;
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

        return userRepository.findAll().stream().map(this::convertirEnResponse).toList();
    }

    public UserResponse modifierRole(Long id, Role nouveauRole) {

        User user = trouverUtilisateur(id);

        if (nouveauRole == null) {throw new BusinessException( "Le rôle est obligatoire");}

        user.setRole(nouveauRole);

        User utilisateurModifie = userRepository.save(user);

        return convertirEnResponse(utilisateurModifie);
    }

    public void supprimer(Long id) {

        User user = trouverUtilisateur(id);

        userRepository.delete(user);
    }

    private User trouverUtilisateur(Long id) {

        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
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



}