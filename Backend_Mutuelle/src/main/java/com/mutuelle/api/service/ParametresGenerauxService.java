package com.mutuelle.api.service;

import com.mutuelle.api.entity.ParametresGeneraux;
import com.mutuelle.api.repository.ParametresGenerauxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ParametresGenerauxService {

    @Autowired
    private ParametresGenerauxRepository repository;

    public ParametresGeneraux getParametres() {
        return repository.findBySingletonGuard((byte) 1)
                .orElseThrow(() -> new IllegalStateException("Les paramètres généraux n'ont pas été initialisés en base de données"));
    }

    public ParametresGeneraux updateParametres(ParametresGeneraux updated) {
        ParametresGeneraux existing = getParametres();
        
        existing.setMontantInscription(updated.getMontantInscription());
        existing.setMontantSolidarite(updated.getMontantSolidarite());
        existing.setTauxInteretEmprunts(updated.getTauxInteretEmprunts());
        existing.setMontantPenaliteRetard(updated.getMontantPenaliteRetard());
        existing.setFacteurEmprunt(updated.getFacteurEmprunt());
        existing.setDureeMaximaleEmprunt(updated.getDureeMaximaleEmprunt());
        
        return repository.save(existing);
    }
}
