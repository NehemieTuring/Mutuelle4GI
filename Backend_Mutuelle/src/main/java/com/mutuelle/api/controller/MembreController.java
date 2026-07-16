package com.mutuelle.api.controller;

import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.service.MembreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<Membre> createMembre(@Valid @RequestBody Membre membre) {
        Membre created = membreService.createMembre(membre);
        return ResponseEntity.ok(created);
    }
}
