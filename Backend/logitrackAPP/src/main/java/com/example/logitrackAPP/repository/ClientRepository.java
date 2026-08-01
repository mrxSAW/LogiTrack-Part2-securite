package com.example.logitrackAPP.repository;

import com.example.logitrackAPP.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {


    List<Client> findByNomContainingIgnoreCaseOrEmailContainingIgnoreCaseOrVilleContainingIgnoreCase(
            String nom, String email, String ville
    );



}