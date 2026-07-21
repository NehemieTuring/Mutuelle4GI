package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Pret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PretRepository extends JpaRepository<Pret, String> {
    List<Pret> findByMembreIdAndStatut(String membreId, String statut);
    boolean existsByStatut(String statut);
}
