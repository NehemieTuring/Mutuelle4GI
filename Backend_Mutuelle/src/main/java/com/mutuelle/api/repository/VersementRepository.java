package com.mutuelle.api.repository;

import com.mutuelle.api.entity.RaisonVersement;
import com.mutuelle.api.entity.StatutVersement;
import com.mutuelle.api.entity.Versement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersementRepository extends JpaRepository<Versement, String> {
    List<Versement> findByStatut(StatutVersement statut);

    List<Versement> findByMembreIdOrderByDateVersementDesc(String membreId);

    List<Versement> findByMembreIdAndRaisonOrderByDateVersementDesc(String membreId, RaisonVersement raison);

    List<Versement> findByRaisonOrderByDateVersementDesc(RaisonVersement raison);

    boolean existsByDescriptionContaining(String fragment);
}
