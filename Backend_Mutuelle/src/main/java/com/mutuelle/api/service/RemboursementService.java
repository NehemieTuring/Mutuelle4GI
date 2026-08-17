package com.mutuelle.api.service;

import com.mutuelle.api.entity.Exercice;
import com.mutuelle.api.entity.Membre;
import com.mutuelle.api.entity.ParametresGeneraux;
import com.mutuelle.api.entity.Pret;
import com.mutuelle.api.entity.Remboursement;
import com.mutuelle.api.repository.MembreRepository;
import com.mutuelle.api.repository.ParametresGenerauxRepository;
import com.mutuelle.api.repository.PretRepository;
import com.mutuelle.api.repository.RemboursementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RemboursementService {

    private static final Logger log = LoggerFactory.getLogger(RemboursementService.class);

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private PretRepository pretRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private ParametresGenerauxRepository parametresGenerauxRepository;

    @Autowired
    private ParametresGenerauxService parametresGenerauxService;

    @Autowired
    private SimulationClock simulationClock;

    @Autowired
    private ExerciceService exerciceService;

    public List<Pret> obtenirTousPrets() {
        return pretRepository.findAllByOrderByDatePretDesc();
    }

    public List<Remboursement> obtenirRemboursementsDuPret(String pretId) {
        return remboursementRepository.findByPretId(pretId);
    }

    public List<Remboursement> obtenirTousRemboursements() {
        return remboursementRepository.findAll();
    }

    public Remboursement demanderRemboursement(String pretId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        Pret pret = pretRepository.findById(pretId)
                .orElseThrow(() -> new IllegalArgumentException("L'emprunt avec l'id " + pretId + " n'existe pas"));

        if (!"non rembourse".equals(pret.getStatut())) {
            throw new IllegalStateException("L'emprunt est déjà remboursé");
        }

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du remboursement doit être strictement positif");
        }

        Membre membre = pret.getMembre();
        BigDecimal detteMembre = membre.getDette() != null ? membre.getDette() : BigDecimal.ZERO;
        BigDecimal dejaEnAttente = remboursementRepository.sumMontantByPretIdAndStatut(pretId, "en_attente_tr");
        if (dejaEnAttente == null) {
            dejaEnAttente = BigDecimal.ZERO;
        }
        BigDecimal restePayable = detteMembre.subtract(dejaEnAttente);
        if (restePayable.compareTo(BigDecimal.ZERO) < 0) {
            restePayable = BigDecimal.ZERO;
        }

        if (montant.compareTo(restePayable) > 0) {
            throw new IllegalArgumentException(
                    "Le montant du remboursement (" + montant + ") dépasse le reste à rembourser disponible ("
                            + restePayable + "). Dette actuelle: " + detteMembre
                            + (dejaEnAttente.compareTo(BigDecimal.ZERO) > 0
                            ? ", déjà en attente de validation: " + dejaEnAttente
                            : ""));
        }

        Remboursement remboursement = Remboursement.builder()
                .id(UUID.randomUUID().toString())
                .pret(pret)
                .exercice(exercice)
                .montant(montant)
                .dateRemboursement(simulationClock.now())
                .statut("en_attente_tr")
                .build();

        Remboursement saved = remboursementRepository.save(remboursement);

        log.info("[NOTIFICATION - TRESORIER] Demande de remboursement créée pour l'emprunt {} (Membre: {}). Montant: {}",
                pretId, pret.getMembre().getCouriel(), montant);

        return saved;
    }

    public List<Remboursement> obtenirRemboursementsEnAttente() {
        return remboursementRepository.findByStatut("en_attente_tr");
    }

    public Remboursement validerRemboursement(String remboursementId) {
        exerciceService.requireExerciceEnCours();
        Remboursement remboursement = remboursementRepository.findById(remboursementId)
                .orElseThrow(() -> new IllegalArgumentException("Le remboursement avec l'id " + remboursementId + " n'existe pas"));

        if (!"en_attente_tr".equals(remboursement.getStatut())) {
            throw new IllegalStateException("Le remboursement n'est pas en attente de validation, statut actuel : " + remboursement.getStatut());
        }

        remboursement.setStatut("valide_tr");
        Remboursement saved = remboursementRepository.save(remboursement);

        Pret pret = remboursement.getPret();
        Membre membre = pret.getMembre();

        // 1. Mettre à jour la dette du membre (dette d'emprunt)
        BigDecimal detteActuelle = membre.getDette() != null ? membre.getDette() : BigDecimal.ZERO;
        BigDecimal nouvelleDette = detteActuelle.subtract(remboursement.getMontant());
        if (nouvelleDette.compareTo(BigDecimal.ZERO) < 0) {
            nouvelleDette = BigDecimal.ZERO;
        }
        membre.setDette(nouvelleDette);
        membreRepository.save(membre);

        // 2. Mettre à jour la caisse des épargnes globale
        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;
        parametres.setCaisseEpargnes(caisseEpargnes.add(remboursement.getMontant()));
        parametresGenerauxRepository.save(parametres);

        // 3. Mettre à jour le statut du prêt et la date de remboursement
        pret.setDateRemboursement(remboursement.getDateRemboursement());
        if (nouvelleDette.compareTo(BigDecimal.ZERO) == 0) {
            pret.setStatut("rembourse");
            log.info("[EMPRUNT - SOLDE] L'emprunt {} du membre {} a été entièrement remboursé.",
                    pret.getId(), membre.getCouriel());
        } else {
            pret.setStatut("non rembourse");
        }
        pretRepository.save(pret);

        log.info("[NOTIFICATION - TRESORIER] Remboursement de {} validé pour le membre {}. Dette emprunt restante: {}. Caisse épargne mise à jour.",
                remboursement.getMontant(), membre.getCouriel(), membre.getDette());

        return saved;
    }

    public Remboursement refuserRemboursement(String remboursementId) {
        exerciceService.requireExerciceEnCours();
        Remboursement remboursement = remboursementRepository.findById(remboursementId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Le remboursement avec l'id " + remboursementId + " n'existe pas"));

        if (!"en_attente_tr".equals(remboursement.getStatut())) {
            throw new IllegalStateException(
                    "Le remboursement n'est pas en attente de validation, statut actuel : "
                            + remboursement.getStatut());
        }

        remboursement.setStatut("refuse_tr");
        Remboursement saved = remboursementRepository.save(remboursement);

        log.info("[NOTIFICATION - TRESORIER] Remboursement {} refusé (montant: {}, prêt: {}).",
                remboursementId, remboursement.getMontant(),
                remboursement.getPret() != null ? remboursement.getPret().getId() : null);

        return saved;
    }

    @Scheduled(cron = "0 0 0 * * ?") // Exécuté tous les jours à minuit
    public void verifierEcheancesEtNotifier() {
        verifierEcheancesEtNotifierDetail();
    }

    /**
     * Vérifie les prêts arrivés à échéance selon l'horloge applicative (réelle ou simulée).
     */
    public Map<String, Object> verifierEcheancesEtNotifierDetail() {
        List<Pret> prets = pretRepository.findAll();
        LocalDateTime now = simulationClock.now();
        List<Map<String, Object>> echus = new ArrayList<>();

        for (Pret pret : prets) {
            if ("non rembourse".equals(pret.getStatut()) &&
                    (pret.getDateEcheance().isBefore(now) || pret.getDateEcheance().isEqual(now))) {

                log.info("[NOTIFICATION - PRESIDENT] L'échéance du prêt {} de {} pour le membre {} est arrivée (horloge: {}).",
                        pret.getId(), pret.getMontant(), pret.getMembre().getCouriel(), now);
                log.info("[NOTIFICATION - SECRETAIRE_GENERAL] L'échéance du prêt {} de {} pour le membre {} est arrivée (horloge: {}).",
                        pret.getId(), pret.getMontant(), pret.getMembre().getCouriel(), now);
                log.info("[NOTIFICATION - MEMBRE] L'échéance de votre prêt {} de {} est arrivée (horloge: {}).",
                        pret.getId(), pret.getMontant(), now);

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("pretId", pret.getId());
                item.put("montant", pret.getMontant());
                item.put("montantARembourser", pret.getMontantARembourser());
                item.put("dateEcheance", pret.getDateEcheance().toString());
                item.put("membre", pret.getMembre().getCouriel());
                item.put("detteMembre", pret.getMembre().getDette());
                item.put("epargneMembre", pret.getMembre().getEpargne());
                item.put("statut", pret.getStatut());
                echus.add(item);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("message", echus.isEmpty()
                ? "Aucun prêt échu à cette date."
                : echus.size() + " prêt(s) échu(s) — notifications envoyées.");
        result.put("dateActuelle", now.toString());
        result.put("horlogeSimulee", simulationClock.isSimulee());
        result.put("pretsEchus", echus);
        return result;
    }

    public void appliquerPenalite(String pretId) {
        exerciceService.requireExerciceEnCours();
        Pret pret = pretRepository.findById(pretId)
                .orElseThrow(() -> new IllegalArgumentException("L'emprunt avec l'id " + pretId + " n'existe pas"));

        if (!"non rembourse".equals(pret.getStatut())) {
            throw new IllegalStateException("L'emprunt est déjà remboursé");
        }

        LocalDateTime now = simulationClock.now();
        if (now.isBefore(pret.getDateEcheance())) {
            throw new IllegalStateException(
                    "L'emprunt n'est pas encore arrivé à échéance (échéance: "
                            + pret.getDateEcheance()
                            + ", date actuelle: "
                            + now
                            + ")");
        }

        ParametresGeneraux params = parametresGenerauxService.getParametres();
        BigDecimal penaliteFixe = params.getMontantPenaliteRetard() != null ? params.getMontantPenaliteRetard() : BigDecimal.ZERO;

        Membre membre = pret.getMembre();
        BigDecimal montantRestant = membre.getDette() != null ? membre.getDette() : BigDecimal.ZERO;

        BigDecimal tauxInteret = params.getTauxInteretEmprunts() != null ? params.getTauxInteretEmprunts() : BigDecimal.ZERO;
        BigDecimal interetCalcule = montantRestant.multiply(tauxInteret).setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal montantADeduire = penaliteFixe.add(interetCalcule);

        BigDecimal epargneActuelle = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;
        if (epargneActuelle.compareTo(montantADeduire) < 0) {
            throw new IllegalStateException("Le membre n'a pas assez d'épargne (" + epargneActuelle + ") pour payer la pénalité (" + montantADeduire + ")");
        }

        membre.setEpargne(epargneActuelle.subtract(montantADeduire));
        membreRepository.save(membre);

        BigDecimal caisseEpargnes = params.getCaisseEpargnes() != null ? params.getCaisseEpargnes() : BigDecimal.ZERO;
        params.setCaisseEpargnes(caisseEpargnes.subtract(montantADeduire));
        parametresGenerauxRepository.save(params);

        log.info("[PENALITE - APPLICATION] Pénalité de retard appliquée pour l'emprunt {} du membre {}. Montant déduit de l'épargne: {} (Pénalité fixe: {}, Intérêts de retard: {}). Épargne restante: {}.",
                pretId, membre.getCouriel(), montantADeduire, penaliteFixe, interetCalcule, membre.getEpargne());
    }
}
