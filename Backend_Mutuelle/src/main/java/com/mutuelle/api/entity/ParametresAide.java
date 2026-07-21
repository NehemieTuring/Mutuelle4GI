package com.mutuelle.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "parametres_aides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametresAide {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotBlank(message = "Le type d'aide est obligatoire")
    @Column(name = "type_aide", nullable = false, unique = true, length = 100)
    private String typeAide;

    @NotNull(message = "Le montant de l'aide est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant de l'aide doit être strictement positif")
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;
}
