package com.mutuelle.api.service;

import com.mutuelle.api.dto.ExerciceCreationResponse;
import com.mutuelle.api.entity.Exercice;
import com.mutuelle.api.entity.ParametresGeneraux;
import com.mutuelle.api.repository.ExerciceRepository;
import com.mutuelle.api.repository.MembreRepository;
import com.mutuelle.api.repository.PretRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class ExerciceService {

    public static final String MESSAGE_AUCUN_EXERCICE =
            "Aucun exercice en cours. Opération impossible.";

    @Autowired
    private ExerciceRepository exerciceRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private PretRepository pretRepository;

    @Autowired
    private ParametresGenerauxService parametresGenerauxService;

    public Optional<Exercice> getExerciceEnCours() {
        return exerciceRepository.findByStatut("en cours");
    }

    public Exercice requireExerciceEnCours() {
        return getExerciceEnCours()
                .orElseThrow(() -> new IllegalStateException(MESSAGE_AUCUN_EXERCICE));
    }

    public List<Exercice> listerExercices() {
        return exerciceRepository.findAllByOrderByDateOuvertureDesc();
    }

    public ExerciceCreationResponse ouvrirExercice(boolean force) {
        if (exerciceRepository.findByStatut("en cours").isPresent()) {
            throw new IllegalStateException("Il y a déjà un exercice en cours.");
        }

        if (!force && pretRepository.existsByStatut("non rembourse")) {
            throw new IllegalStateException("Impossible d'ouvrir un exercice car il y a des emprunts non remboursés.");
        }

        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        long totalMembres = membreRepository.count();
        if (totalMembres == 0) {
            throw new IllegalStateException("Aucun membre enregistré dans la mutuelle.");
        }

        long membresActifs = membreRepository.countByEtatNot("Inactif");
        if (membresActifs == 0) {
            throw new IllegalStateException(
                    "Aucun membre actif pour répartir les renflouements d'inscription et de solidarité.");
        }

        BigDecimal nbActifs = BigDecimal.valueOf(membresActifs);

        // Renflouement caisse solidarités :
        // (montant_solidarité × total membres) − solde actuel de la caisse,
        // réparti entre les membres actifs.
        BigDecimal cibleSolidarite = parametres.getMontantSolidarite()
                .multiply(BigDecimal.valueOf(totalMembres));
        BigDecimal soldeCaisseSolidarite = parametres.getCaisseSolidarites() != null
                ? parametres.getCaisseSolidarites()
                : BigDecimal.ZERO;
        BigDecimal montantRenflouementSolidarite = cibleSolidarite.subtract(soldeCaisseSolidarite);
        if (montantRenflouementSolidarite.compareTo(BigDecimal.ZERO) < 0) {
            montantRenflouementSolidarite = BigDecimal.ZERO;
        }
        BigDecimal partSolidarite = montantRenflouementSolidarite.divide(nbActifs, 0, RoundingMode.CEILING);

        // Renflouement caisse inscriptions : (mensualité × nb mois) + complément + forfait,
        // réparti entre les membres actifs uniquement.
        BigDecimal montantRenflouementInscription = parametres.getMontantRenflouementInscription();
        BigDecimal partInscription = montantRenflouementInscription.divide(nbActifs, 0, RoundingMode.CEILING);

        if (partSolidarite.compareTo(BigDecimal.ZERO) > 0) {
            membreRepository.appliquerPartSolidariteOuvertureExercice(partSolidarite);
        }
        if (partInscription.compareTo(BigDecimal.ZERO) > 0) {
            membreRepository.appliquerPartInscriptionOuvertureExercice(partInscription);
        }
        membreRepository.recalculerEtatApresOuvertureExercice();

        Exercice exercice = Exercice.builder()
                .id(UUID.randomUUID().toString())
                .dateOuverture(LocalDateTime.now())
                .statut("en cours")
                .build();
        Exercice saved = exerciceRepository.save(exercice);

        log.info("[EXERCICE] Nouvel exercice ouvert (ID: {}). "
                        + "Renflouement inscription: {} / {} actifs → part {}. "
                        + "Renflouement solidarité: {} (cible {} − caisse {}) / {} actifs → part {}.",
                saved.getId(),
                montantRenflouementInscription, membresActifs, partInscription,
                montantRenflouementSolidarite, cibleSolidarite, soldeCaisseSolidarite, membresActifs, partSolidarite);

        return ExerciceCreationResponse.builder()
                .exercice(saved)
                .partSolidarite(partSolidarite)
                .partInscription(partInscription)
                .montantRenflouementInscription(montantRenflouementInscription)
                .montantRenflouementSolidarite(montantRenflouementSolidarite)
                .nbMembresActifs(membresActifs)
                .build();
    }

    public Exercice cloturerExercice() {
        Exercice active = exerciceRepository.findByStatut("en cours")
                .orElseThrow(() -> new IllegalStateException("Aucun exercice n'est en cours."));

        if (pretRepository.existsByStatut("non rembourse")) {
            throw new IllegalStateException("Impossible de clôturer l'exercice s'il y a des prêts en cours.");
        }

        active.setStatut("ferme");
        active.setDateFermeture(LocalDateTime.now());
        Exercice saved = exerciceRepository.save(active);

        log.info("[EXERCICE] Exercice clôturé (ID: {})", saved.getId());

        return saved;
    }
}
