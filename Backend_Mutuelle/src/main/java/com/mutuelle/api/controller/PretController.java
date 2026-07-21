package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.service.RemboursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prets")
@CrossOrigin(origins = "*")
public class PretController {

    @Autowired
    private RemboursementService remboursementService;

    @PostMapping("/verifier-echeances")
    public ResponseEntity<?> verifierEcheances() {
        try {
            remboursementService.verifierEcheancesEtNotifier();
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Vérification des échéances effectuée avec succès et notifications envoyées.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/{id}/appliquer-penalite")
    public ResponseEntity<?> appliquerPenalite(@PathVariable String id) {
        try {
            remboursementService.appliquerPenalite(id);
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Pénalité appliquée avec succès.")
                    .build());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
