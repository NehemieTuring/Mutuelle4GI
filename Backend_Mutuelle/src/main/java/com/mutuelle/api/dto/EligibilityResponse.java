package com.mutuelle.api.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityResponse {
    private boolean eligible;
    private String message;

    /** Montant max d'emprunt (épargne × facteur), renseigné pour l'éligibilité prêt. */
    private BigDecimal montantMaximum;

    /** Facteur d'emprunt issu des paramètres généraux, renseigné pour l'éligibilité prêt. */
    private Integer facteurEmprunt;

    public EligibilityResponse(boolean eligible, String message) {
        this.eligible = eligible;
        this.message = message;
    }
}
