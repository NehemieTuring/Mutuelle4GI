package com.mutuelle.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "L'identifiant/login est obligatoire")
    private String login;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}
