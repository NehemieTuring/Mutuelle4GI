package com.mutuelle.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModifierMotDePasseRequest {

    /** Requis si le compte est déjà vérifié (changement depuis Mon compte). */
    private String ancienMotDePasse;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    private String nouveauMotDePasse;
}
