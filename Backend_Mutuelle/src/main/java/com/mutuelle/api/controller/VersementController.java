package com.mutuelle.api.controller;

import com.mutuelle.api.dto.DemandeInscriptionRequest;
import com.mutuelle.api.dto.DemandeSolidariteRequest;
import com.mutuelle.api.dto.DemandeEpargneRequest;
import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.entity.RaisonVersement;
import com.mutuelle.api.entity.Versement;
import com.mutuelle.api.service.VersementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versements")
@CrossOrigin(origins = "*")
public class VersementController {

    @Autowired
    private VersementService versementService;

    @PostMapping("/inscription")
    public ResponseEntity<?> demanderInscription(@Valid @RequestBody DemandeInscriptionRequest request) {
        try {
            Versement versement = versementService.demanderInscription(request.getMembreId(), request.getMontant());
            return ResponseEntity.status(HttpStatus.CREATED).body(versement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/solidarite")
    public ResponseEntity<?> demanderSolidarite(@Valid @RequestBody DemandeSolidariteRequest request) {
        try {
            Versement versement = versementService.demanderSolidarite(request.getMembreId(), request.getMontant());
            return ResponseEntity.status(HttpStatus.CREATED).body(versement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/epargne")
    public ResponseEntity<?> demanderEpargne(@Valid @RequestBody DemandeEpargneRequest request) {
        try {
            Versement versement = versementService.demanderEpargne(request.getMembreId(), request.getMontant());
            return ResponseEntity.status(HttpStatus.CREATED).body(versement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<List<Versement>> obtenirTousVersements(
            @RequestParam(required = false) String raison) {
        if (raison != null && !raison.isBlank()) {
            try {
                RaisonVersement raisonEnum = RaisonVersement.valueOf(raison);
                return ResponseEntity.ok(versementService.obtenirVersementsParRaison(raisonEnum));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(versementService.obtenirTousVersements());
    }

    @GetMapping("/membre/{membreId}")
    public ResponseEntity<List<Versement>> obtenirVersementsDuMembre(
            @PathVariable String membreId,
            @RequestParam(required = false) String raison) {
        if (raison != null && !raison.isBlank()) {
            try {
                RaisonVersement raisonEnum = RaisonVersement.valueOf(raison);
                return ResponseEntity.ok(
                        versementService.obtenirVersementsDuMembreParRaison(membreId, raisonEnum));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(versementService.obtenirVersementsDuMembre(membreId));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<Versement>> obtenirVersementsEnAttente() {
        return ResponseEntity.ok(versementService.obtenirVersementsEnAttente());
    }

    @PostMapping("/{id}/accepter")
    public ResponseEntity<?> accepterVersement(@PathVariable String id) {
        try {
            Versement versement = versementService.accepterVersement(id);
            return ResponseEntity.ok(versement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/{id}/refuser")
    public ResponseEntity<?> refuserVersement(@PathVariable String id) {
        try {
            Versement versement = versementService.refuserVersement(id);
            return ResponseEntity.ok(versement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
