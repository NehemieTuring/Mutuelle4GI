package com.mutuelle.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMembreRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String prenom;

    @NotBlank(message = "L'adresse courriel est obligatoire")
    @Email(message = "L'adresse courriel doit respecter le format valide")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "L'adresse courriel doit respecter le format valide")
    private String couriel;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(
            regexp = "^(?:\\+?237)?[26]\\d{8}$",
            message = "Le téléphone doit être un numéro camerounais valide (mobile 6XXXXXXXX ou Camtel 2XXXXXXXX)"
    )
    private String telephone;

    @Pattern(regexp = "^.*\\.(jpe?g|png)$", message = "La photo doit être au format JPEG, JPG ou PNG")
    private String photo;

    private Boolean inscriptionPayee;
}
