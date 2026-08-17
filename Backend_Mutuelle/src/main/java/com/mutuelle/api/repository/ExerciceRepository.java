package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Exercice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciceRepository extends JpaRepository<Exercice, String> {
    Optional<Exercice> findByStatut(String statut);

    List<Exercice> findAllByOrderByDateOuvertureDesc();
}
