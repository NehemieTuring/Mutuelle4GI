package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Membre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembreRepository extends JpaRepository<Membre, String> {
    Optional<Membre> findByCouriel(String couriel);
    long countByEtat(String etat);
    boolean existsByDetteGreaterThan(java.math.BigDecimal val);
}
