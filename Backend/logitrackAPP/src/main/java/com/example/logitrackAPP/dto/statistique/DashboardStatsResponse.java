package com.example.logitrackAPP.dto.statistique;

import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.Produit;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardStatsResponse {

    private long nombreClients;
    private long nombreProduits;
    private long nombreCommandes;

    private long commandesEnAttente;
    private long commandesExpediees;
    private long commandesLivrees;

    private List<Produit> produitsStockFaible;
    private String produitLePlusCommande;
    private List<Commande> commandesRecentes;
}