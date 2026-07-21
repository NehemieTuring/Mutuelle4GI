package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.dto.RemboursementRequest;
import com.mutuelle.api.entity.Remboursement;
import com.mutuelle.api.service.RemboursementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remboursements")
@CrossOrigin(origins = "*")
public class RemboursementController {

    @Autowired
    private RemboursementService remboursementService;

    @PostMapping
    public ResponseEntity<?> demanderRemboursement(@Valid @RequestBody RemboursementRequest request) {
        try {
            Remboursement remboursement = remboursementService.demanderRemboursement(request.getPretId(), request.getMontant());
            return ResponseEntity.status(HttpStatus.CREATED).body(remboursement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<Remboursement>> obtenirRemboursementsEnAttente() {
        return ResponseEntity.ok(remboursementService.obtenirRemboursementsEnAttente());
    }

    @PostMapping("/{id}/valider")
    public ResponseEntity<?> validerRemboursement(@PathVariable String id) {
        try {
            Remboursement remboursement = remboursementService.validerRemboursement(id);
            return ResponseEntity.ok(remboursement);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
