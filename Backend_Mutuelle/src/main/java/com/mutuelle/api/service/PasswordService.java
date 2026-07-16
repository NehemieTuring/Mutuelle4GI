package com.mutuelle.api.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        if (encodedPassword == null) {
            return false;
        }
        // Si le mot de passe stocké est au format BCrypt (commence par $2a$, $2b$ ou $2y$)
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, encodedPassword);
        }
        // Sinon, comparaison en texte brut pour les données initiales de test/brouillon
        return rawPassword.equals(encodedPassword);
    }
}
