package com.mutuelle.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeAideRequest {
    @NotBlank(message = "L'identifiant du membre est obligatoire")
    private String membreId;

    @NotBlank(message = "Le type d'aide est obligatoire")
    private String typeAide;
}
