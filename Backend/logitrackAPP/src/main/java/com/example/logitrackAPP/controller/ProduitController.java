package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.service.ProduitService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/products")
public class ProduitController {

    private final ProduitService service;

    public ProduitController(ProduitService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public Produit ajouter(@Valid @RequestBody Produit produit) {
        return service.ajouter(produit);
    }


    @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'MANAGER')")
    @GetMapping
    public List<Produit> afficher() {
        return service.afficherTous();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'MANAGER')")
    @GetMapping("/{id}")
    public Produit get(@PathVariable Long id) {
        return service.getById(id);
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public Produit modifier(@PathVariable Long id, @Valid @RequestBody Produit produit) {
        return service.modifier(id, produit);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void supprimer(@PathVariable Long id) {
        service.supprimer(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'MANAGER')")
    @GetMapping("/category/{categorie}")
    public List<Produit> getByCategorie(@PathVariable String categorie) {
        return service.getByCategorie(categorie);
    }

    @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'MANAGER')")
    @GetMapping("/price/{prix}")
    public List<Produit> getByPrix(@PathVariable double prix) {
        return service.getByPrix(prix);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/low-stock")
    public List<Produit> lowStock() {
        return service.getLowStock();
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/top")
    public List<String> topProduct() {
        return service.getTopProduct();
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/search")
    public List<Produit> rechercher(@RequestParam String keyword ) {
        return service.rechercher(keyword);
    }



    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/page")
    public Page<Produit> afficherAvecPagination(@ParameterObject Pageable pageable) {
        return service.afficherAvecPagination(pageable);
    }
}