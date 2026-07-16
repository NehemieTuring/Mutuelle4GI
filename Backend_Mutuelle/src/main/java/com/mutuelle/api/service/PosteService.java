package com.mutuelle.api.service;

import com.mutuelle.api.entity.IntitulePoste;
import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.entity.Poste;
import com.mutuelle.api.repository.MembreRepository;
import com.mutuelle.api.repository.PosteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PosteService {

    @Autowired
    private PosteRepository posteRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private PasswordService passwordService;

    public List<Poste> getAllPostes() {
        return posteRepository.findAll();
    }

    public Optional<Poste> getPosteById(String id) {
        return posteRepository.findById(id);
    }

    public Optional<Poste> loginAdministration(String login, String password) {
        Optional<Poste> posteOpt = posteRepository.findByLogin(login);
        if (posteOpt.isPresent()) {
            Poste poste = posteOpt.get();
            if (passwordService.matches(password, poste.getMotDePasse())) {
                return Optional.of(poste);
            }
        }
        return Optional.empty();
    }

    public Optional<Membre> getMembreOccupantPoste(IntitulePoste intitule) {
        return posteRepository.findByIntitule(intitule)
                .map(Poste::getMembre);
    }

    public Poste updatePoste(String id, Poste updated) {
        Poste existing = posteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Poste avec l'id " + id + " n'existe pas"));
        
        existing.setIntitule(updated.getIntitule());
        existing.setDescription(updated.getDescription());
        existing.setLogin(updated.getLogin());
        
        if (updated.getMotDePasse() != null && !updated.getMotDePasse().trim().isEmpty()) {
            existing.setMotDePasse(passwordService.encode(updated.getMotDePasse()));
        }
        
        if (updated.getMembre() != null && updated.getMembre().getId() != null) {
            Membre membre = membreRepository.findById(updated.getMembre().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + updated.getMembre().getId() + " non trouvé"));
            existing.setMembre(membre);
        }
        
        return posteRepository.save(existing);
    }

    public Poste createPoste(Poste poste) {
        if (poste.getMotDePasse() == null || poste.getMotDePasse().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire pour la création d'un poste");
        }
        poste.setMotDePasse(passwordService.encode(poste.getMotDePasse()));
        if (poste.getMembre() != null && poste.getMembre().getId() != null) {
            Membre membre = membreRepository.findById(poste.getMembre().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + poste.getMembre().getId() + " non trouvé"));
            poste.setMembre(membre);
        }
        return posteRepository.save(poste);
    }
}
