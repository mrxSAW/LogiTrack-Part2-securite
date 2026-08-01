package com.example.logitrackAPP.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AjouterProduitCommandeRequest {

    @NotNull(message = "L'identifiant du produit est obligatoire")
    private Long produitId;

    @Positive(message = "La quantité doit être supérieure à zéro")
    private int quantite;
}