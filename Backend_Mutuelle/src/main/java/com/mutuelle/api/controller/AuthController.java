package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginRequest;
import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.entity.Poste;
import com.mutuelle.api.service.MembreService;
import com.mutuelle.api.service.PosteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private MembreService membreService;

    @Autowired
    private PosteService posteService;

    @PostMapping("/login-membre")
    public ResponseEntity<LoginResponse> loginMembre(@Valid @RequestBody LoginRequest request) {
        Optional<Membre> membreOpt = membreService.loginMembre(request.getLogin(), request.getPassword());
        if (membreOpt.isPresent()) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Connexion réussie en tant que membre")
                    .data(membreOpt.get())
                    .build());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                .success(false)
                .message("Adresse courriel ou mot de passe incorrect")
                .build());
    }

    @PostMapping("/login-administration")
    public ResponseEntity<LoginResponse> loginAdministration(@Valid @RequestBody LoginRequest request) {
        Optional<Poste> posteOpt = posteService.loginAdministration(request.getLogin(), request.getPassword());
        if (posteOpt.isPresent()) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Connexion réussie au compte à responsabilité : " + posteOpt.get().getIntitule())
                    .data(posteOpt.get())
                    .build());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                .success(false)
                .message("Identifiant (login) ou mot de passe de poste incorrect")
                .build());
    }
}
