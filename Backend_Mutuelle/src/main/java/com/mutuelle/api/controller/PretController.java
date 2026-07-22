package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.entity.Pret;
import com.mutuelle.api.entity.Remboursement;
import com.mutuelle.api.service.RemboursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prets")
@CrossOrigin(origins = "*")
public class PretController {

    @Autowired
    private RemboursementService remboursementService;

    @GetMapping
    public ResponseEntity<List<Pret>> obtenirTousPrets() {
        return ResponseEntity.ok(remboursementService.obtenirTousPrets());
    }

    @GetMapping("/{id}/remboursements")
    public ResponseEntity<List<Remboursement>> obtenirRemboursementsDuPret(@PathVariable String id) {
        return ResponseEntity.ok(remboursementService.obtenirRemboursementsDuPret(id));
    }

    @PostMapping("/verifier-echeances")
    public ResponseEntity<?> verifierEcheances() {
        try {
            var result = remboursementService.verifierEcheancesEtNotifierDetail();
            return ResponseEntity.ok(result);
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
