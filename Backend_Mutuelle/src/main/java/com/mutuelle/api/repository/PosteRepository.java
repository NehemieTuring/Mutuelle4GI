package com.mutuelle.api.repository;

import com.mutuelle.api.entity.IntitulePoste;
import com.mutuelle.api.entity.Poste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PosteRepository extends JpaRepository<Poste, String> {
    Optional<Poste> findByLogin(String login);
    Optional<Poste> findByIntitule(IntitulePoste intitule);
}
