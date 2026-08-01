package com.example.logitrackAPP.service;

import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    private final ProduitRepository repository;

    public ProduitService(ProduitRepository repository) {
        this.repository = repository;
    }

    public Produit ajouter(Produit produit) {
        return repository.save(produit);
    }

    public List<Produit> afficherTous() {
        return repository.findAll();
    }

    public Optional<Produit> getById(Long id) {
        return repository.findById(id);
    }

    public void supprimer(Long id) {
        repository.deleteById(id);
    }


    public List<Produit> getByCategorie(String categorie) {
        return repository.findByCategorie(categorie);
    }

    public List<Produit> getByPrix(double prix) {
        return repository.findByPrixLessThan(prix);
    }

    public List<Produit> getLowStock() {
        return repository.findLowStockProducts();
    }

    public List<String> getTopProduct() {
        return repository.findTopProduct();
    }


    public Produit modifier(Long id, Produit nouveauProduit) {

        Produit produitExistant = repository.findById(id).orElseThrow(() ->
                        new RuntimeException("Produit non trouvé")
                );

        produitExistant.setNom(nouveauProduit.getNom());
        produitExistant.setCategorie(nouveauProduit.getCategorie());
        produitExistant.setPrix(nouveauProduit.getPrix());
        produitExistant.setQuantiteStock(
                nouveauProduit.getQuantiteStock()
        );

        return repository.save(produitExistant);
    }


    public List<Produit> rechercher(String motCle) {

        if (motCle == null || motCle.trim().isEmpty()) {
            return repository.findAll();
        }

        String recherche = motCle.trim();

        return repository.findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(
                        recherche, recherche
                );
    }

    public Page<Produit> afficherAvecPagination(Pageable pageable) {
        return repository.findAll(pageable);
    }

}