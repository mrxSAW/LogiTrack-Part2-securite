package com.example.logitrackAPP.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    @Positive(message = "Le prix doit être supérieur à zéro")
    private double prix;

    @PositiveOrZero(message = "La quantité en stock ne peut pas être négative")
    private int quantiteStock;
}