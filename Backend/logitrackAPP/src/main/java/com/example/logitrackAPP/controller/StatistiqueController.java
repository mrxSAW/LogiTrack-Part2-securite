package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.service.StatistiqueService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/statistiques")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class StatistiqueController {

    private final StatistiqueService service;

    public StatistiqueController(StatistiqueService service) {
        this.service = service;
    }


    @GetMapping("/commandes/total")
    public long totalCommandes() {
        return service.nombreTotalCommandes();
    }


    @GetMapping("/produits/stock-faible")
    public List<Produit> stockFaible() {
        return service.produitsStockFaible();
    }


    @GetMapping("/produits/top")
    public Produit produitTop() {
        return service.produitLePlusCommande();
    }
}