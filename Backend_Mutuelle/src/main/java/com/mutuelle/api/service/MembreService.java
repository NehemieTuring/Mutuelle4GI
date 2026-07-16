package com.mutuelle.api.service;

import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.repository.MembreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MembreService {

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private PasswordService passwordService;

    public List<Membre> getAllMembres() {
        return membreRepository.findAll();
    }

    public Optional<Membre> getMembreById(String id) {
        return membreRepository.findById(id);
    }

    public Optional<Membre> loginMembre(String email, String password) {
        Optional<Membre> membreOpt = membreRepository.findByCouriel(email);
        if (membreOpt.isPresent()) {
            Membre membre = membreOpt.get();
            if (passwordService.matches(password, membre.getMotDePasse())) {
                return Optional.of(membre);
            }
        }
        return Optional.empty();
    }

    public Membre updateMembre(String id, Membre updated) {
        Membre existing = membreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + id + " n'existe pas"));
        
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setCouriel(updated.getCouriel());
        existing.setTelephone(updated.getTelephone());
        existing.setPhoto(updated.getPhoto());
        
        if (updated.getMotDePasse() != null && !updated.getMotDePasse().trim().isEmpty()) {
            existing.setMotDePasse(passwordService.encode(updated.getMotDePasse()));
        }
        
        return membreRepository.save(existing);
    }

    public Membre createMembre(Membre membre) {
        if (membre.getMotDePasse() == null || membre.getMotDePasse().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire pour la création d'un membre");
        }
        membre.setMotDePasse(passwordService.encode(membre.getMotDePasse()));
        return membreRepository.save(membre);
    }
}
