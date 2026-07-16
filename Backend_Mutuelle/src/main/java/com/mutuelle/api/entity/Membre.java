package com.mutuelle.api.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "membres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @NotBlank(message = "L'adresse courriel est obligatoire")
    @Email(message = "L'adresse courriel doit respecter le format valide")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "L'adresse courriel doit respecter le format valide")
    @Column(name = "couriel", nullable = false, unique = true)
    private String couriel;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Column(name = "telephone", nullable = false, length = 50)
    private String telephone;

    @Pattern(regexp = "^.*\\.(jpe?g|png)$", message = "La photo doit être au format JPEG, JPG ou PNG")
    @Column(name = "photo", length = 512)
    private String photo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_derniere_connexion", nullable = false)
    private LocalDateTime dateDerniereConnexion;
}
