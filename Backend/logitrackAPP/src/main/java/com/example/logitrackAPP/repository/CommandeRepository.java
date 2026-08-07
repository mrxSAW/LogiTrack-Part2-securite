package com.example.logitrackAPP.repository;

import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.StatutCommande;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommandeRepository
        extends JpaRepository<Commande, Long> {


    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    List<Commande> findAllBy();


    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    Optional<Commande> findOneById(Long id);


    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    Page<Commande> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    List<Commande> findByClientId(Long clientId);

    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    List<Commande> findByStatut( StatutCommande statut);

    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    List<Commande> findByClientIdAndStatut(Long clientId, StatutCommande statut);


    long countByStatut(StatutCommande statut);

    @EntityGraph(attributePaths = {"client", "lignes", "lignes.produit"})
    List<Commande> findTop5ByOrderByDateCommandeDesc();

}