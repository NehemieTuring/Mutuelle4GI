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
public class RemboursementRequest {
    @NotBlank(message = "L'identifiant de l'emprunt est obligatoire")
    private String pretId;

    @NotNull(message = "Le montant du remboursement est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant du remboursement doit être strictement positif")
    private BigDecimal montant;
}
