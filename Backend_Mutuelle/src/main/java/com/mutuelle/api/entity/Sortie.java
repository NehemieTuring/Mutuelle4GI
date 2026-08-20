package com.mutuelle.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sorties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sortie {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotNull(message = "Le montant de la sortie est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant de la sortie doit être strictement positif")
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @CreationTimestamp
    @Column(name = "date_sortie", nullable = false, updatable = false)
    private LocalDateTime dateSortie;

    @ManyToOne(optional = false)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @JsonIgnore
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_id", nullable = false)
    private Exercice exercice;

    @NotBlank(message = "La raison de la sortie est obligatoire")
    @Column(name = "raison", nullable = false)
    private String raison;

    @NotNull(message = "Le statut de la sortie est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 50)
    @Builder.Default
    private StatutSortie statut = StatutSortie.en_attente_secretaire_general;
}
