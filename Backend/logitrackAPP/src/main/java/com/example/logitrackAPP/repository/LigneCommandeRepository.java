package com.example.logitrackAPP.repository;

import com.example.logitrackAPP.model.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {
}