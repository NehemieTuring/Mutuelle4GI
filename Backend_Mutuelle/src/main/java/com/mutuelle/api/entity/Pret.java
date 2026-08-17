package com.mutuelle.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "prets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pret {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @NotNull
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @NotNull
    @Column(name = "date_pret", nullable = false)
    private LocalDateTime datePret;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_id", nullable = false)
    private Exercice exercice;

    @NotNull
    @Column(name = "raison", nullable = false)
    private String raison;

    @NotNull
    @Column(name = "montant_a_rembourser", nullable = false, precision = 15, scale = 2)
    private BigDecimal montantARembourser;

    @NotNull
    @Column(name = "date_echeance", nullable = false)
    private LocalDateTime dateEcheance;

    @NotNull
    @Column(name = "statut", nullable = false, length = 50)
    @Builder.Default
    private String statut = "non rembourse"; // "rembourse", "non rembourse"

    @Column(name = "date_remboursement")
    private LocalDateTime dateRemboursement;

    /**
     * Parts de chaque créancier (épargnant) dans la répartition des intérêts du prêt.
     * Clé : id membre ; valeur : part (0–1, ex. 0.35 = 35 %).
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "liste_creatiers", columnDefinition = "json")
    @Builder.Default
    private Map<String, BigDecimal> listeCreatiers = new HashMap<>();
}
