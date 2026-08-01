package com.example.logitrackAPP.repository;

import com.example.logitrackAPP.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByCategorie(String categorie);

    List<Produit> findByPrixLessThan(double prix);

    @Query("SELECT p FROM Produit p WHERE p.quantiteStock < 5")
    List<Produit> findLowStockProducts();

    @Query("""
       SELECT lc.produit.nom FROM LigneCommande lc
       GROUP BY lc.produit.nom
       ORDER BY SUM(lc.quantite) DESC
       """)
    List<String> findTopProduct();



    List<Produit> findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(
            String nom,
            String categorie
    );


}