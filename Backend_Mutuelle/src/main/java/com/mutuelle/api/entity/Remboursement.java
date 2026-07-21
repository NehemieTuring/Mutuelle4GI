package com.mutuelle.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "remboursements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Remboursement {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @NotNull
    @Column(name = "date_remboursement", nullable = false)
    private LocalDateTime dateRemboursement;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pret_id", nullable = false)
    private Pret pret;

    @NotNull
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @NotNull
    @Column(name = "statut", nullable = false, length = 50)
    @Builder.Default
    private String statut = "en_attente_tr"; // "en_attente_tr", "valide_tr"
}
