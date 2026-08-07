package com.example.logitrackAPP.service;

import com.example.logitrackAPP.exception.ResourceNotFoundException;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public Produit getById(Long id) {

        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
    }


    public Produit modifier(Long id, Produit nouveauProduit) {

        Produit produitExistant = getById(id);

        produitExistant.setNom(nouveauProduit.getNom());
        produitExistant.setCategorie(nouveauProduit.getCategorie());
        produitExistant.setPrix(nouveauProduit.getPrix());
        produitExistant.setQuantiteStock(nouveauProduit.getQuantiteStock());

        return repository.save(produitExistant);
    }

    public void supprimer(Long id) {

        Produit produit = getById(id);

        repository.delete(produit);
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

    public List<Produit> rechercher(String motCle) {

        if (motCle == null || motCle.trim().isEmpty()) {
            return repository.findAll();
        }

        String recherche = motCle.trim();

        return repository.findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(recherche, recherche);
    }

    public Page<Produit> afficherAvecPagination(Pageable pageable) {
        return repository.findAll(pageable);
    }




}