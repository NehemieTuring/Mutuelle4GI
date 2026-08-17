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
    long countByEtatNot(String etat);
    boolean existsByDetteGreaterThan(BigDecimal val);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Membre m SET m.detteSolidarite = m.detteSolidarite + :partSolidarite
            WHERE m.etat <> 'Inactif'
            """)
    void appliquerPartSolidariteOuvertureExercice(@Param("partSolidarite") BigDecimal partSolidarite);

    /** Renflouement inscription : uniquement les membres actifs (etat <> Inactif). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Membre m SET m.detteInscription = m.detteInscription + :partInscription
            WHERE m.etat <> 'Inactif'
            """)
    void appliquerPartInscriptionOuvertureExercice(@Param("partInscription") BigDecimal partInscription);

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
