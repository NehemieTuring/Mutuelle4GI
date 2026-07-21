package com.mutuelle.api.repository;

import com.mutuelle.api.entity.StatutVersement;
import com.mutuelle.api.entity.Versement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersementRepository extends JpaRepository<Versement, String> {
    List<Versement> findByStatut(StatutVersement statut);
}
