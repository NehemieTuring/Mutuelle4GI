package com.mutuelle.api.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "postes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poste {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotNull(message = "L'intitulé du poste est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "intitule", nullable = false, unique = true, length = 50)
    private IntitulePoste intitule;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Le login est obligatoire")
    @Email(message = "Le login doit respecter le format d'une adresse courriel")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Le login doit respecter le format d'une adresse courriel")
    @Column(name = "login", nullable = false, unique = true)
    private String login;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_derniere_connexion", nullable = false)
    private LocalDateTime dateDerniereConnexion;

    @NotNull(message = "Le membre occupant le poste est obligatoire")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;
}
