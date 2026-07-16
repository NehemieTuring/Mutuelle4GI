package com.mutuelle.api.controller;

import com.mutuelle.api.entity.IntitulePoste;
import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.entity.Poste;
import com.mutuelle.api.service.PosteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/postes")
@CrossOrigin(origins = "*")
public class PosteController {

    @Autowired
    private PosteService posteService;

    @GetMapping
    public ResponseEntity<List<Poste>> getAllPostes() {
        return ResponseEntity.ok(posteService.getAllPostes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poste> getPosteById(@PathVariable String id) {
        return posteService.getPosteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/occupant/{intitule}")
    public ResponseEntity<Membre> getMembreOccupantPoste(@PathVariable String intitule) {
        try {
            IntitulePoste intituleEnum = IntitulePoste.valueOf(intitule.toUpperCase());
            return posteService.getMembreOccupantPoste(intituleEnum)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Poste> updatePoste(@PathVariable String id, @Valid @RequestBody Poste poste) {
        try {
            Poste updated = posteService.updatePoste(id, poste);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
