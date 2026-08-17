package com.mutuelle.api.controller;

import com.mutuelle.api.dto.DemandeAideRequest;
import com.mutuelle.api.dto.DemandePretRequest;
import com.mutuelle.api.dto.DemandeRetraitRequest;
import com.mutuelle.api.dto.EligibilityResponse;
import com.mutuelle.api.dto.SoldeTotalResponse;
import com.mutuelle.api.entity.ParametresAide;
import com.mutuelle.api.entity.Pret;
import com.mutuelle.api.entity.Sortie;
import com.mutuelle.api.service.SortieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SortieController {

    @Autowired
    private SortieService sortieService;

    @GetMapping("/membres/{membreId}/solde-total")
    public ResponseEntity<SoldeTotalResponse> obtenirSoldeTotal(@PathVariable String membreId) {
        SoldeTotalResponse response = sortieService.obtenirSoldeTotal(membreId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/membres/{membreId}/sorties")
    public ResponseEntity<List<Sortie>> obtenirSortiesDuMembre(@PathVariable String membreId) {
        return ResponseEntity.ok(sortieService.obtenirSortiesDuMembre(membreId));
    }

    @GetMapping("/membres/{membreId}/prets")
    public ResponseEntity<List<Pret>> obtenirPretsDuMembre(@PathVariable String membreId) {
        return ResponseEntity.ok(sortieService.obtenirPretsDuMembre(membreId));
    }

    @GetMapping("/membres/{membreId}/eligible-aide")
    public ResponseEntity<EligibilityResponse> verifierEligibiliteAide(@PathVariable String membreId) {
        EligibilityResponse response = sortieService.verifierEligibiliteAide(membreId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/membres/{membreId}/eligible-pret")
    public ResponseEntity<EligibilityResponse> verifierEligibilitePret(@PathVariable String membreId) {
        EligibilityResponse response = sortieService.verifierEligibilitePret(membreId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sorties")
    public ResponseEntity<List<Sortie>> obtenirToutesSorties() {
        return ResponseEntity.ok(sortieService.obtenirToutesSorties());
    }

    @GetMapping("/sorties/en-attente-sg")
    public ResponseEntity<List<Sortie>> obtenirSortiesEnAttenteSg() {
        return ResponseEntity.ok(sortieService.obtenirSortiesEnAttenteSg());
    }

    @GetMapping("/sorties/en-attente-tr")
    public ResponseEntity<List<Sortie>> obtenirSortiesEnAttenteTr() {
        return ResponseEntity.ok(sortieService.obtenirSortiesEnAttenteTr());
    }

    @PostMapping("/sorties/demande-pret")
    public ResponseEntity<?> demanderPret(@Valid @RequestBody DemandePretRequest request) {
        try {
            Sortie sortie = sortieService.demanderPret(request.getMembreId(), request.getMontant());
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/demande-retrait")
    public ResponseEntity<?> demanderRetrait(@Valid @RequestBody DemandeRetraitRequest request) {
        try {
            Sortie sortie = sortieService.demanderRetrait(request.getMembreId(), request.getMontant());
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/demande-aide")
    public ResponseEntity<?> demanderAide(@Valid @RequestBody DemandeAideRequest request) {
        try {
            Sortie sortie = sortieService.demanderAide(request.getMembreId(), request.getTypeAide());
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/{id}/accepter-sg")
    public ResponseEntity<?> accepterSg(@PathVariable String id) {
        try {
            Sortie sortie = sortieService.accepterSg(id);
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/{id}/refuser-sg")
    public ResponseEntity<?> refuserSg(@PathVariable String id) {
        try {
            Sortie sortie = sortieService.refuserSg(id);
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/{id}/accepter-tr")
    public ResponseEntity<?> accepterTr(@PathVariable String id) {
        try {
            Sortie sortie = sortieService.accepterTr(id);
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/{id}/refuser-tr")
    public ResponseEntity<?> refuserTr(@PathVariable String id) {
        try {
            Sortie sortie = sortieService.refuserTr(id);
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sorties/{id}/confirmer-membre")
    public ResponseEntity<?> confirmerMembre(@PathVariable String id) {
        try {
            Sortie sortie = sortieService.confirmerMembre(id);
            return ResponseEntity.ok(sortie);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new EligibilityResponse(false, e.getMessage()));
        }
    }
}
