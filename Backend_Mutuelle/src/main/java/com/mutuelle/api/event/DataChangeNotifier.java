package com.mutuelle.api.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class DataChangeNotifier {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(ex -> emitters.remove(emitter));
        return emitter;
    }

    public void notifyChange(DataChangeScope scope, String path) {
        if (scope == null) {
            return;
        }
        notifyChanges(List.of(scope), path);
    }

    public void notifyChanges(List<DataChangeScope> scopes, String path) {
        if (scopes == null || scopes.isEmpty()) {
            return;
        }
        for (DataChangeScope scope : scopes) {
            if (scope != null) {
                sendRefresh(scope, path);
            }
        }
    }

    private void sendRefresh(DataChangeScope scope, String path) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("scope", scope.name());
        if (path != null) {
            payload.put("path", path);
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("Impossible de sérialiser l'événement SSE: {}", e.getMessage());
            return;
        }

        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("refresh").data(json));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }

    public void sendHeartbeat() {
        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ping").data("ok"));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }

    /**
     * Plusieurs scopes peuvent être notifiés : une mutation de versement
     * met aussi à jour le membre (inscriptionPayee, dettes, etc.).
     */
    public List<DataChangeScope> resolveScopes(String path) {
        Set<DataChangeScope> scopes = new LinkedHashSet<>();
        if (path == null) {
            scopes.add(DataChangeScope.all);
            return new ArrayList<>(scopes);
        }
        if (path.startsWith("/api/membres")) {
            scopes.add(DataChangeScope.membres);
        } else if (path.startsWith("/api/versements")) {
            scopes.add(DataChangeScope.versements);
            scopes.add(DataChangeScope.membres);
        } else if (path.startsWith("/api/sorties") || path.contains("/sorties")) {
            scopes.add(DataChangeScope.sorties);
            scopes.add(DataChangeScope.membres);
            scopes.add(DataChangeScope.prets);
        } else if (path.startsWith("/api/remboursements")) {
            scopes.add(DataChangeScope.remboursements);
            scopes.add(DataChangeScope.membres);
            scopes.add(DataChangeScope.prets);
        } else if (path.startsWith("/api/prets")) {
            scopes.add(DataChangeScope.prets);
            scopes.add(DataChangeScope.membres);
        } else if (path.startsWith("/api/exercices")) {
            scopes.add(DataChangeScope.exercices);
            scopes.add(DataChangeScope.membres);
        } else if (path.startsWith("/api/parametres")
                || path.startsWith("/api/aides-parametres")
                || path.startsWith("/api/postes")) {
            scopes.add(DataChangeScope.parametres);
        } else {
            scopes.add(DataChangeScope.all);
        }
        return new ArrayList<>(scopes);
    }

    /** @deprecated préférer {@link #resolveScopes(String)} */
    public DataChangeScope resolveScope(String path) {
        List<DataChangeScope> scopes = resolveScopes(path);
        return scopes.isEmpty() ? DataChangeScope.all : scopes.get(0);
    }
}
