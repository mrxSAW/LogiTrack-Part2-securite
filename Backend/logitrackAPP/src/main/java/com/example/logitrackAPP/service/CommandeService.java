package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.AjouterProduitCommandeRequest;
import com.example.logitrackAPP.model.*;
import com.example.logitrackAPP.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class CommandeService {

    private final CommandeRepository repository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final LigneCommandeRepository ligneCommandeRepository;

    public CommandeService(CommandeRepository repository, ClientRepository clientRepository, ProduitRepository produitRepository, LigneCommandeRepository ligneCommandeRepository) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
    }


    public Commande createOrder(Long clientId) {

        Client client = clientRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Commande commande = new Commande();
        commande.setClient(client);
        commande.setStatut(StatutCommande.EN_ATTENTE);
        commande.setDateCommande(LocalDate.now());

        return repository.save(commande);
    }




    @Transactional
    public Commande ajouterProduit(Long orderId, AjouterProduitCommandeRequest request) {


        if (request == null) {
            throw new RuntimeException("Les informations du produit sont obligatoires");
        }


        if (request.getProduitId() == null) {
            throw new RuntimeException("L'identifiant du produit est obligatoire");
        }


        if (request.getQuantite() <= 0) { throw new RuntimeException(
                    "La quantité doit être supérieure à zéro"
            );}


        Commande commande = repository.findById(orderId).orElseThrow(() ->
                        new RuntimeException("Commande non trouvée")
                );

        if (commande.getStatut() != StatutCommande.EN_ATTENTE) { throw new RuntimeException(
                    "Impossible d'ajouter un produit : la commande n'est plus en attente"
            );
        }

        Produit produit = produitRepository.findById(request.getProduitId()).orElseThrow(() ->
                        new RuntimeException("Produit non trouvé")
                );

        if (produit.getQuantiteStock() < request.getQuantite()) { throw new RuntimeException(
                    "Stock insuffisant. Stock disponible : "
                            + produit.getQuantiteStock()
            );
        }

        int nouveauStock = produit.getQuantiteStock() - request.getQuantite();

        produit.setQuantiteStock(nouveauStock);

        produitRepository.save(produit);


        LigneCommande ligne = new LigneCommande();

        ligne.setCommande(commande);
        ligne.setProduit(produit);
        ligne.setQuantite(request.getQuantite());

        ligneCommandeRepository.save(ligne);

        return commande;
    }


    public List<Commande> afficherToutes() {
        return repository.findAll();
    }


    public Commande getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    }


    public Commande changerStatut(Long id, StatutCommande statut) {

        Commande commande = repository.findById(id).orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        commande.setStatut(statut);

        return repository.save(commande);
    }


    public long countCommandes() {
        return repository.count();
    }


    public List<Commande> filtrer(Long clientId, StatutCommande statut) {

        if (clientId != null && statut != null) {
            return repository.findByClientIdAndStatut(clientId, statut);
        }

        if (clientId != null) {
            return repository.findByClientId(clientId);
        }

        if (statut != null) {
            return repository.findByStatut(statut);
        }

        return repository.findAll();
    }



    public Page<Commande> afficherAvecPagination(Pageable pageable) {
        return repository.findAll(pageable);
    }






}