package com.mutuelle.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "versements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Versement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotNull(message = "Le montant du versement est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant du versement doit être supérieur à 0")
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @CreationTimestamp
    @Column(name = "date_versement", nullable = false, updatable = false)
    private LocalDateTime dateVersement;

    @NotNull(message = "Le membre effectuant le versement est obligatoire")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @JsonIgnore
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_id", nullable = false)
    private Exercice exercice;

    @NotNull(message = "La raison du versement est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "raison", nullable = false, length = 50)
    private RaisonVersement raison;

    @NotNull(message = "Le statut du versement est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 50)
    private StatutVersement statut;

    @Column(name = "description", length = 512)
    private String description;
}
