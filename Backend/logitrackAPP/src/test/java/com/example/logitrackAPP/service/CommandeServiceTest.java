package com.example.logitrackAPP.service;

import com.example.logitrackAPP.dto.AjouterProduitCommandeRequest;
import com.example.logitrackAPP.exception.BusinessException;
import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.LigneCommande;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.model.StatutCommande;
import com.example.logitrackAPP.repository.ClientRepository;
import com.example.logitrackAPP.repository.CommandeRepository;
import com.example.logitrackAPP.repository.LigneCommandeRepository;
import com.example.logitrackAPP.repository.ProduitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommandeServiceTest {

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private LigneCommandeRepository ligneRepository;

    private CommandeService commandeService;

    @BeforeEach
    void preparerTest() {

        commandeService = new CommandeService(commandeRepository, clientRepository, produitRepository, ligneRepository);
    }

    @Test
    void ajouterProduitDoitDiminuerLeStock() {

        Commande commande = new Commande();
        commande.setId(1L);
        commande.setStatut(StatutCommande.EN_ATTENTE);
        commande.setLignes(new ArrayList<>());

        Produit produit = new Produit();
        produit.setId(2L);
        produit.setNom("Clavier");
        produit.setQuantiteStock(10);

        AjouterProduitCommandeRequest request = new AjouterProduitCommandeRequest();

        request.setProduitId(2L);
        request.setQuantite(3);

        when(commandeRepository.findOneById(1L)).thenReturn(Optional.of(commande));

        when(produitRepository.findById(2L)).thenReturn(Optional.of(produit));

        Commande resultat = commandeService.ajouterProduit(
                        1L,
                        request
                           );

        assertEquals(
                7,
                produit.getQuantiteStock()
        );

        assertEquals(
                1,
                resultat.getLignes().size()
        );

        assertSame(produit, resultat.getLignes().get(0).getProduit()
        );

        verify(produitRepository).save(produit);

        verify(ligneRepository)
                .save(any(LigneCommande.class));
    }



    @Test
    void ajouterProduitDoitRefuserStockInsuffisant() {

        Commande commande = new Commande();
        commande.setId(1L);
        commande.setStatut(StatutCommande.EN_ATTENTE);
        commande.setLignes(new ArrayList<>());

        Produit produit = new Produit();
        produit.setId(2L);
        produit.setNom("Clavier");
        produit.setQuantiteStock(2);

        AjouterProduitCommandeRequest request = new AjouterProduitCommandeRequest();

        request.setProduitId(2L);
        request.setQuantite(5);

        when(commandeRepository.findOneById(1L)).thenReturn(Optional.of(commande));

        when(produitRepository.findById(2L)).thenReturn(Optional.of(produit));

        BusinessException exception =
                assertThrows( BusinessException.class, () -> commandeService.ajouterProduit(1L, request) );

        assertEquals(
                "Stock insuffisant. Stock disponible : 2",
                exception.getMessage()
        );

        assertEquals(
                2,
                produit.getQuantiteStock()
        );

        verify(produitRepository, never())
                .save(any(Produit.class));

        verify(ligneRepository, never())
                .save(any(LigneCommande.class));
    }



    @Test
    void statutDoitPasserDeEnAttenteAExpediee() {

        Commande commande = new Commande();
        commande.setId(1L);
        commande.setStatut(StatutCommande.EN_ATTENTE);
        commande.setLignes(new ArrayList<>());

        when(commandeRepository.findOneById(1L)).thenReturn(Optional.of(commande));

        when(commandeRepository.save(commande)).thenReturn(commande);

        Commande resultat =
                commandeService.changerStatut(
                        1L,
                        StatutCommande.EXPEDIEE
                );

        assertEquals(StatutCommande.EXPEDIEE, resultat.getStatut());

        verify(commandeRepository).save(commande);
    }



    @Test
    void statutNeDoitPasRevenirDeLivreeAEnAttente() {

        Commande commande = new Commande();
        commande.setId(1L);
        commande.setStatut(StatutCommande.LIVREE);
        commande.setLignes(new ArrayList<>());

        when(commandeRepository.findOneById(1L)).thenReturn(Optional.of(commande));

        BusinessException exception = assertThrows( BusinessException.class, () -> commandeService.changerStatut(
                                1L,
                                StatutCommande.EN_ATTENTE )
                );

        assertEquals("Transition de statut interdite : " + "LIVREE vers EN_ATTENTE",
                exception.getMessage()
        );

        verify(commandeRepository, never()).save(any(Commande.class));
    }








}