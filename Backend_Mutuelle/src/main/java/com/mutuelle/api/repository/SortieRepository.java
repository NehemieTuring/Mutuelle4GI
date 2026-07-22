package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Sortie;
import com.mutuelle.api.entity.StatutSortie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SortieRepository extends JpaRepository<Sortie, String> {
    List<Sortie> findByStatut(StatutSortie statut);
    List<Sortie> findByStatutOrderByDateSortieDesc(StatutSortie statut);
    List<Sortie> findByMembreId(String membreId);
    List<Sortie> findAllByOrderByDateSortieDesc();
}
