package com.mutuelle.api.repository;

import com.mutuelle.api.entity.ParametresAide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParametresAideRepository extends JpaRepository<ParametresAide, String> {
    Optional<ParametresAide> findByTypeAide(String typeAide);
}
