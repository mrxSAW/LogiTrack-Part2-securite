package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.statistique.DashboardStatsResponse;
import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.model.StatutCommande;
import com.example.logitrackAPP.repository.ClientRepository;
import com.example.logitrackAPP.repository.CommandeRepository;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatistiqueService {

    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;

    public StatistiqueService(ClientRepository clientRepository, ProduitRepository produitRepository, CommandeRepository commandeRepository) {
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.commandeRepository = commandeRepository;
    }

    public long nombreTotalCommandes() {
        return commandeRepository.count();
    }

    public List<Produit> produitsStockFaible() {
        return produitRepository.findLowStockProducts();
    }

    public String produitLePlusCommande() {

        List<String> produitsTries = produitRepository.findTopProduct();

        if (produitsTries.isEmpty()) {
            return null;
        }

        return produitsTries.get(0);
    }

    public DashboardStatsResponse obtenirDashboard() {

        long nombreClients = clientRepository.count();

        long nombreProduits = produitRepository.count();

        long nombreCommandes = commandeRepository.count();

        long commandesEnAttente = commandeRepository.countByStatut(StatutCommande.EN_ATTENTE);

        long commandesExpediees = commandeRepository.countByStatut(StatutCommande.EXPEDIEE);

        long commandesLivrees = commandeRepository.countByStatut(StatutCommande.LIVREE);

        List<Produit> stockFaible = produitRepository.findLowStockProducts();

        String produitTop = produitLePlusCommande();

        List<Commande> commandesRecentes = commandeRepository.findTop5ByOrderByDateCommandeDesc();

        return new DashboardStatsResponse(
                nombreClients,
                nombreProduits,
                nombreCommandes,
                commandesEnAttente,
                commandesExpediees,
                commandesLivrees,
                stockFaible,
                produitTop,
                commandesRecentes
        );
    }
}