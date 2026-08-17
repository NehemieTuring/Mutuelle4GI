package com.mutuelle.api.controller;

import com.mutuelle.api.dto.ExerciceCreationResponse;
import com.mutuelle.api.entity.Exercice;
import com.mutuelle.api.service.ExerciceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercices")
@CrossOrigin(origins = "*")
public class ExerciceController {

    @Autowired
    private ExerciceService exerciceService;

    @GetMapping("/en-cours")
    public ResponseEntity<Exercice> getExerciceEnCours() {
        return exerciceService.getExerciceEnCours()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping
    public ResponseEntity<List<Exercice>> listerExercices() {
        return ResponseEntity.ok(exerciceService.listerExercices());
    }

    @PostMapping("/ouvrir")
    public ResponseEntity<?> ouvrirExercice() {
        try {
            ExerciceCreationResponse response = exerciceService.ouvrirExercice(false);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/ouvrir-force")
    public ResponseEntity<?> ouvrirExerciceForce() {
        try {
            ExerciceCreationResponse response = exerciceService.ouvrirExercice(true);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cloturer")
    public ResponseEntity<?> cloturerExercice() {
        try {
            Exercice active = exerciceService.cloturerExercice();
            return ResponseEntity.ok(active);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
