package com.example.logitrackAPP.dto.auth;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModifierSuspensionRequest {

    @NotNull(message = "la valeur de suspenssion est obligatoire")
    private boolean suspendu ;

}
