package com.mutuelle.api.controller;

import com.mutuelle.api.dto.CreateMembreRequest;
import com.mutuelle.api.dto.ModifierMotDePasseRequest;
import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.service.MembreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membres")
@CrossOrigin(origins = "*")
public class MembreController {

    @Autowired
    private MembreService membreService;

    @GetMapping
    public ResponseEntity<List<Membre>> getAllMembres() {
        return ResponseEntity.ok(membreService.getAllMembres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membre> getMembreById(@PathVariable String id) {
        return membreService.getMembreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Membre> updateMembre(@PathVariable String id, @Valid @RequestBody Membre membre) {
        try {
            Membre updated = membreService.updateMembre(id, membre);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> enregistrerMembre(@Valid @RequestBody CreateMembreRequest request) {
        try {
            Membre created = membreService.enregistrerMembre(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new com.mutuelle.api.dto.LoginResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{id}/modifier-mot-de-passe")
    public ResponseEntity<?> modifierMotDePasse(@PathVariable String id, @Valid @RequestBody ModifierMotDePasseRequest request) {
        try {
            Membre updated = membreService.modifierMotDePasse(
                    id, request.getNouveauMotDePasse(), request.getAncienMotDePasse());
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Mot de passe modifié avec succès. Votre compte est maintenant vérifié.")
                    .data(updated)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
