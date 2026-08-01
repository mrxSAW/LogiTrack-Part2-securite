package com.example.logitrackAPP.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String nom;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "L'adresse email n'est pas valide")
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[0-9+ ]{9,15}$", message = "Le numéro de téléphone n'est pas valide")
    private String telephone;

    @NotBlank(message = "La ville est obligatoire")
    private String ville;

    @JsonIgnore
    @OneToMany(mappedBy = "client")
    private List<Commande> commandes;
}