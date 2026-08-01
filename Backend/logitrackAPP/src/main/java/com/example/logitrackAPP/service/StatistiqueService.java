package com.example.logitrackAPP.service;

import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.repository.CommandeRepository;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatistiqueService {

    private final CommandeRepository commandeRepository;
    private final ProduitRepository produitRepository;

    public StatistiqueService(CommandeRepository commandeRepository,
                              ProduitRepository produitRepository) {
        this.commandeRepository = commandeRepository;
        this.produitRepository = produitRepository;
    }


    public long nombreTotalCommandes() {
        return commandeRepository.count();
    }


    public List<Produit> produitsStockFaible() {
        return produitRepository.findAll()
                .stream()
                .filter(p -> p.getQuantiteStock() < 5)
                .toList();
    }


    public Produit produitLePlusCommande() {
        List<Produit> produits = produitRepository.findAll();

        if (produits.isEmpty()) return null;

        return produits.get(0);
    }
}