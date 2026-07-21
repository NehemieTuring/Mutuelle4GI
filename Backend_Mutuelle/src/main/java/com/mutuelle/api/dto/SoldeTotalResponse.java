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
public class SoldeTotalResponse {
    private BigDecimal epargne;
    private BigDecimal interet;
    private BigDecimal soldeTotal;
}
