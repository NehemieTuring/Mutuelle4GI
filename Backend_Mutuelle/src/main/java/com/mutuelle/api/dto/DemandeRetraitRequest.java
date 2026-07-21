package com.mutuelle.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeRetraitRequest {
    @NotBlank(message = "L'identifiant du membre est obligatoire")
    private String membreId;

    @NotNull(message = "Le montant du retrait est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant du retrait doit être strictement positif")
    private BigDecimal montant;
}
