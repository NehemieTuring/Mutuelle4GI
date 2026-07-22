package com.mutuelle.api.controller;

import com.mutuelle.api.dto.LoginResponse;
import com.mutuelle.api.dto.SimulationHorlogeRequest;
import com.mutuelle.api.service.SimulationClock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
@CrossOrigin(origins = "*")
public class SimulationController {

    @Autowired
    private SimulationClock simulationClock;

    @GetMapping("/horloge")
    public ResponseEntity<Map<String, Object>> obtenirHorloge() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("simulee", simulationClock.isSimulee());
        body.put("dateActuelle", simulationClock.now().toString());
        body.put("dateSysteme", LocalDateTime.now().toString());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/horloge")
    public ResponseEntity<?> definirHorloge(@RequestBody SimulationHorlogeRequest request) {
        if (request == null || request.getDate() == null || request.getDate().isBlank()) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message("Indiquez une date (ex. 2026-10-25T12:00:00).")
                    .build());
        }
        try {
            LocalDateTime parsed = LocalDateTime.parse(request.getDate().trim());
            simulationClock.setDateSimulee(parsed);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", true);
            body.put("message", "Horloge simulée activée.");
            body.put("simulee", true);
            body.put("dateActuelle", simulationClock.now().toString());
            return ResponseEntity.ok(body);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .success(false)
                    .message("Format de date invalide. Utilisez ISO-8601, ex. 2026-10-25T12:00:00")
                    .build());
        }
    }

    @DeleteMapping("/horloge")
    public ResponseEntity<?> reinitialiserHorloge() {
        simulationClock.reset();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Horloge réelle rétablie.");
        body.put("simulee", false);
        body.put("dateActuelle", simulationClock.now().toString());
        return ResponseEntity.ok(body);
    }
}
