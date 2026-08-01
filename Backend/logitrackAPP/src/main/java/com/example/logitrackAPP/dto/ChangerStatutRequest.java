package com.example.logitrackAPP.dto;

import com.example.logitrackAPP.model.StatutCommande;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangerStatutRequest {



    @NotNull(message = "Le statut est obligatoire")
    private StatutCommande statut;
}