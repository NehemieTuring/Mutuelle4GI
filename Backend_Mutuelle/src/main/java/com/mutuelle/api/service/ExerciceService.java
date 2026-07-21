package com.mutuelle.api.service;

import com.mutuelle.api.dto.ExerciceCreationResponse;
import com.mutuelle.api.entity.Exercice;
import com.mutuelle.api.entity.Membre;
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
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class ExerciceService {

    @Autowired
    private ExerciceRepository exerciceRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private PretRepository pretRepository;

    @Autowired
    private ParametresGenerauxService parametresGenerauxService;

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

        BigDecimal montantSolidarite = parametres.getMontantSolidarite();
        BigDecimal montantInscription = parametres.getMontantInscription();

        BigDecimal cmaxSolidarite = montantSolidarite.multiply(BigDecimal.valueOf(totalMembres));
        BigDecimal cmaxInscription = montantInscription.multiply(BigDecimal.valueOf(totalMembres));

        long membresAJour = membreRepository.countByEtat("a jour");
        long diviseur = membresAJour > 0 ? membresAJour : totalMembres;

        BigDecimal partSolidarite = cmaxSolidarite.divide(BigDecimal.valueOf(diviseur), 0, RoundingMode.CEILING);
        BigDecimal partInscription = cmaxInscription.divide(BigDecimal.valueOf(diviseur), 0, RoundingMode.CEILING);

        List<Membre> membres = membreRepository.findAll();
        for (Membre membre : membres) {
            // Update solidarite
            BigDecimal dsActuelle = membre.getDetteSolidarite() != null ? membre.getDetteSolidarite() : BigDecimal.ZERO;
            BigDecimal dsNouvelle = dsActuelle.add(partSolidarite);
            membre.setDetteSolidarite(dsNouvelle);
            if (dsNouvelle.compareTo(BigDecimal.ZERO) > 0) {
                membre.setSolidaritePayee(false);
            }

            // Update inscription
            BigDecimal diActuelle = membre.getDetteInscription() != null ? membre.getDetteInscription() : BigDecimal.ZERO;
            BigDecimal diNouvelle = diActuelle.add(partInscription);
            membre.setDetteInscription(diNouvelle);
            if (diNouvelle.compareTo(BigDecimal.ZERO) > 0) {
                membre.setInscriptionPayee(false);
            }

            // Update member state
            if (dsNouvelle.compareTo(new BigDecimal("250000.00")) >= 0) {
                membre.setEtat("Inactif");
            } else if (dsNouvelle.compareTo(BigDecimal.ZERO) > 0) {
                membre.setEtat("non a jour");
            } else {
                membre.setEtat("a jour");
            }

            membreRepository.save(membre);
        }

        Exercice exercice = Exercice.builder()
                .id(UUID.randomUUID().toString())
                .dateOuverture(LocalDateTime.now())
                .statut("en cours")
                .build();
        Exercice saved = exerciceRepository.save(exercice);

        log.info("[EXERCICE] Nouvel exercice ouvert (ID: {}). Part solidarité: {}, Part inscription: {}",
                saved.getId(), partSolidarite, partInscription);

        return ExerciceCreationResponse.builder()
                .exercice(saved)
                .partSolidarite(partSolidarite)
                .partInscription(partInscription)
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
