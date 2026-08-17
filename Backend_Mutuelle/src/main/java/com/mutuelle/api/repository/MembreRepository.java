package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Membre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface MembreRepository extends JpaRepository<Membre, String> {
    Optional<Membre> findByCouriel(String couriel);
    long countByEtat(String etat);
    boolean existsByDetteGreaterThan(BigDecimal val);

    /**
     * Mise à jour en masse lors de l'ouverture d'exercice (évite la re-validation JPA
     * sur des champs inchangés comme le téléphone).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Membre m SET
                m.detteSolidarite = m.detteSolidarite + :partSolidarite,
                m.detteInscription = m.detteInscription + :partInscription
            """)
    void appliquerPartsOuvertureExercice(
            @Param("partSolidarite") BigDecimal partSolidarite,
            @Param("partInscription") BigDecimal partInscription);

    /** Recalcule état et drapeaux de paiement à partir des dettes courantes. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Membre m SET
                m.solidaritePayee = CASE WHEN m.detteSolidarite > 0 THEN false ELSE m.solidaritePayee END,
                m.inscriptionPayee = CASE WHEN m.detteInscription > 0 THEN false ELSE m.inscriptionPayee END,
                m.etat = CASE
                    WHEN m.detteSolidarite >= 250000 THEN 'Inactif'
                    WHEN m.detteSolidarite > 0 THEN 'non a jour'
                    ELSE 'a jour'
                END
            """)
    void recalculerEtatApresOuvertureExercice();
}
