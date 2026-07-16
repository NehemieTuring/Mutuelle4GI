package com.mutuelle.api.repository;

import com.mutuelle.api.entity.ParametresGeneraux;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParametresGenerauxRepository extends JpaRepository<ParametresGeneraux, String> {
    Optional<ParametresGeneraux> findBySingletonGuard(Byte singletonGuard);
}
