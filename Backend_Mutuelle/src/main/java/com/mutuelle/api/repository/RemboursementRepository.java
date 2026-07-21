package com.mutuelle.api.repository;

import com.mutuelle.api.entity.Remboursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RemboursementRepository extends JpaRepository<Remboursement, String> {
    List<Remboursement> findByPretId(String pretId);
    List<Remboursement> findByPretIdAndStatut(String pretId, String statut);
    List<Remboursement> findByStatut(String statut);

    @Query("SELECT COALESCE(SUM(r.montant), 0.00) FROM Remboursement r WHERE r.pret.id = :pretId AND r.statut = :statut")
    BigDecimal sumMontantByPretIdAndStatut(@Param("pretId") String pretId, @Param("statut") String statut);
}
