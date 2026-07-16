package com.mutuelle.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "parametres_generaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametresGeneraux {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotNull(message = "Le montant d'inscription est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le montant d'inscription doit être positif")
    @Column(name = "montant_inscription", nullable = false, precision = 15, scale = 2)
    private BigDecimal montantInscription;

    @NotNull(message = "Le montant de solidarité est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le montant de solidarité doit être positif")
    @Column(name = "montant_solidarite", nullable = false, precision = 15, scale = 2)
    private BigDecimal montantSolidarite;

    @NotNull(message = "Le taux d'intérêt des emprunts est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le taux d'intérêt doit être positif")
    @Column(name = "taux_interet_emprunts", nullable = false, precision = 5, scale = 4)
    private BigDecimal tauxInteretEmprunts;

    @NotNull(message = "Le montant de pénalité de retard est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le montant de pénalité de retard doit être positif")
    @Column(name = "montant_penalite_retard", nullable = false, precision = 15, scale = 2)
    private BigDecimal montantPenaliteRetard;

    @NotNull(message = "Le facteur d'emprunt est obligatoire")
    @Min(value = 1, message = "Le facteur d'emprunt doit être supérieur ou égal à 1")
    @Column(name = "facteur_emprunt", nullable = false)
    private Integer facteurEmprunt;

    @Column(name = "singleton_guard", nullable = false, unique = true)
    @Builder.Default
    private Byte singletonGuard = 1;
}
