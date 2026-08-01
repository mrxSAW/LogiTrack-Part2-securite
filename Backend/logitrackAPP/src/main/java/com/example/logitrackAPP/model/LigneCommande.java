package com.example.logitrackAPP.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantite;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Produit produit;


    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "commande_id")
    private Commande commande;
}