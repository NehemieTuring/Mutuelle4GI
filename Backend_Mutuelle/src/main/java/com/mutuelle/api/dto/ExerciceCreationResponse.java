package com.mutuelle.api.dto;

import com.mutuelle.api.entity.Exercice;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ExerciceCreationResponse {
    private Exercice exercice;
    private BigDecimal partSolidarite;
    private BigDecimal partInscription;
}
