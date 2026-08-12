package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.AjouterProduitCommandeRequest;
import com.example.logitrackAPP.exception.BusinessException;
import com.example.logitrackAPP.exception.ResourceNotFoundException;
import com.example.logitrackAPP.model.Client;
import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.LigneCommande;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.model.StatutCommande;
import com.example.logitrackAPP.repository.ClientRepository;
import com.example.logitrackAPP.repository.CommandeRepository;
import com.example.logitrackAPP.repository.LigneCommandeRepository;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommandeService {

    private final CommandeRepository repository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final LigneCommandeRepository ligneRepository;

    public CommandeService(
            CommandeRepository repository,
            ClientRepository clientRepository,
            ProduitRepository produitRepository,
            LigneCommandeRepository ligneRepository
    ) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.ligneRepository = ligneRepository;
    }

    public Commande createOrder(Long clientId) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Client non trouvé"
                        )
                );

        Commande commande = new Commande();
        commande.setClient(client);
        commande.setStatut(StatutCommande.EN_ATTENTE);
        commande.setDateCommande(LocalDate.now());
        commande.setLignes(new ArrayList<>());

        return repository.save(commande);
    }

    @Transactional
    public Commande ajouterProduit(Long orderId, AjouterProduitCommandeRequest request) {

        if (request == null) {
            throw new BusinessException(
                    "Les informations sont obligatoires"
            );
        }

        if (request.getProduitId() == null) {
            throw new BusinessException(
                    "L'identifiant du produit est obligatoire"
            );
        }

        if (request.getQuantite() <= 0) {
            throw new BusinessException(
                    "La quantité doit être supérieure à zéro"
            );
        }

        Commande commande = trouverCommande(orderId);

        if (commande.getStatut()
                != StatutCommande.EN_ATTENTE) {

            throw new BusinessException(
                    "La commande n'est plus en attente"
            );
        }

        Produit produit = produitRepository
                .findById(request.getProduitId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Produit non trouvé"
                        )
                );

        if (produit.getQuantiteStock() < request.getQuantite()) {

            throw new BusinessException(
                    "Stock insuffisant. Stock disponible : "
                            + produit.getQuantiteStock()
            );
        }

        produit.setQuantiteStock( produit.getQuantiteStock() - request.getQuantite());

        produitRepository.save(produit);

        LigneCommande ligne = new LigneCommande();
        ligne.setCommande(commande);
        ligne.setProduit(produit);
        ligne.setQuantite(request.getQuantite());

        ligneRepository.save(ligne);

        if (commande.getLignes() == null) {
            commande.setLignes(new ArrayList<>());
        }

        commande.getLignes().add(ligne);

        return commande;
    }

    public List<Commande> afficherToutes() {
        return repository.findAllBy();
    }

    public Commande getById(Long id) {
        return trouverCommande(id);
    }

    public Commande changerStatut( Long id, StatutCommande nouveauStatut) {

        Commande commande = trouverCommande(id);

        StatutCommande statutActuel = commande.getStatut();

        if (statutActuel == nouveauStatut) {
            return commande;
        }

        boolean transitionValide = statutActuel == StatutCommande.EN_ATTENTE && nouveauStatut == StatutCommande.EXPEDIEE;

        transitionValide = transitionValide || statutActuel == StatutCommande.EXPEDIEE && nouveauStatut == StatutCommande.LIVREE;

        if (!transitionValide) {
            throw new BusinessException(
                    "Transition de statut interdite : "
                            + statutActuel
                            + " vers "
                            + nouveauStatut
            );
        }

        commande.setStatut(nouveauStatut);

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

        return repository.findAllBy();
    }

    public Page<Commande> afficherAvecPagination(Pageable pageable) {
        return repository.findAllBy(pageable);
    }

    private Commande trouverCommande(Long id) {

        return repository.findOneById(id).orElseThrow(() -> new ResourceNotFoundException(
                                "Commande non trouvée"
                        )
                );
    }


    @Transactional
    public void supprimer(Long id) {

        Commande commande = trouverCommande(id);


        if (commande.getStatut() == StatutCommande.EN_ATTENTE) {

            for (LigneCommande ligne : commande.getLignes()) {

                Produit produit = ligne.getProduit();

                produit.setQuantiteStock(produit.getQuantiteStock() + ligne.getQuantite());

                produitRepository.save(produit);
            }
        }

        repository.delete(commande);
    }


    public LocalDate returnerLancienne (Long id1 , long id2){
       Commande   comnde1 = repository.findById(id1).orElseThrow(() -> new ResourceNotFoundException( "Commande 1 introuvable" ));
       Commande  comonde2 = repository.findById(id2).orElseThrow(() -> new ResourceNotFoundException( "Commande 2 introuvable" ));;

        if(comnde1.getDateCommande().isBefore(comonde2.getDateCommande())){
            return  comnde1.getDateCommande();
        }


            return comonde2.getDateCommande();



    }



}