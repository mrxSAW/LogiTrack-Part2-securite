package com.example.logitrackAPP.repository;

import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeRepository extends JpaRepository<Commande, Long> {

    List<Commande> findByClientId(Long clientId);

    List<Commande> findByStatut(StatutCommande statut);

    List<Commande> findByClientIdAndStatut(Long clientId, StatutCommande statut);

}