package com.mutuelle.api.controller;

import com.mutuelle.api.entity.ParametresGeneraux;
import com.mutuelle.api.service.ParametresGenerauxService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parametres")
@CrossOrigin(origins = "*")
public class ParametresController {

    @Autowired
    private ParametresGenerauxService service;

    @GetMapping
    public ResponseEntity<ParametresGeneraux> getParametres() {
        try {
            return ResponseEntity.ok(service.getParametres());
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping
    public ResponseEntity<ParametresGeneraux> updateParametres(@Valid @RequestBody ParametresGeneraux parametres) {
        try {
            return ResponseEntity.ok(service.updateParametres(parametres));
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/montant-inscription")
    public ResponseEntity<java.math.BigDecimal> getMontantInscription() {
        try {
            return ResponseEntity.ok(service.getParametres().getMontantInscription());
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/montant-solidarite")
    public ResponseEntity<java.math.BigDecimal> getMontantSolidarite() {
        try {
            return ResponseEntity.ok(service.getParametres().getMontantSolidarite());
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
