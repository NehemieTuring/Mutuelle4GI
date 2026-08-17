package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.entity.ParametresAide;
import com.mutuelle.api.repository.ParametresAideRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/aides-parametres")
@CrossOrigin(origins = "*")
public class ParametresAideController {

    @Autowired
    private ParametresAideRepository repository;

    @GetMapping
    public ResponseEntity<List<ParametresAide>> list() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ParametresAide body) {
        try {
            if (body.getTypeAide() != null) {
                body.setTypeAide(body.getTypeAide().trim().toLowerCase());
            }
            if (repository.findByTypeAide(body.getTypeAide()).isPresent()) {
                return ResponseEntity.badRequest().body(LoginResponse.builder()
                        .success(false)
                        .message("Un type d'aide « " + body.getTypeAide() + " » existe déjà")
                        .build());
            }
            body.setId(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody ParametresAide body) {
        Optional<ParametresAide> existingOpt = repository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        try {
            ParametresAide existing = existingOpt.get();
            String type = body.getTypeAide() != null
                    ? body.getTypeAide().trim().toLowerCase()
                    : existing.getTypeAide();
            Optional<ParametresAide> sameType = repository.findByTypeAide(type);
            if (sameType.isPresent() && !sameType.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(LoginResponse.builder()
                        .success(false)
                        .message("Un type d'aide « " + type + " » existe déjà")
                        .build());
            }
            existing.setTypeAide(type);
            existing.setMontant(body.getMontant());
            return ResponseEntity.ok(repository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.ok(LoginResponse.builder()
                .success(true)
                .message("Type d'aide supprimé")
                .build());
    }
}
