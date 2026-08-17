package com.mutuelle.api.service;

import com.mutuelle.api.dto.EligibilityResponse;
import com.mutuelle.api.dto.SoldeTotalResponse;
import com.mutuelle.api.entity.*;
import com.mutuelle.api.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SortieService {

    @Autowired
    private SortieRepository sortieRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private ParametresAideRepository parametresAideRepository;

    @Autowired
    private ParametresGenerauxRepository parametresGenerauxRepository;

    @Autowired
    private ParametresGenerauxService parametresGenerauxService;

    @Autowired
    private PretRepository pretRepository;

    @Autowired
    private ExerciceService exerciceService;

    private String formatMontant(BigDecimal montant) {
        if (montant == null) {
            return "0 FCFA";
        }
        return montant.stripTrailingZeros().toPlainString() + " FCFA";
    }

    public SoldeTotalResponse obtenirSoldeTotal(String membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        BigDecimal epargne = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;
        BigDecimal interet = membre.getInteret() != null ? membre.getInteret() : BigDecimal.ZERO;
        BigDecimal soldeTotal = epargne.add(interet);

        return SoldeTotalResponse.builder()
                .epargne(epargne)
                .interet(interet)
                .soldeTotal(soldeTotal)
                .build();
    }

    public EligibilityResponse verifierEligibiliteAide(String membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        boolean isInscriptionPayee = membre.getInscriptionPayee() != null && membre.getInscriptionPayee();
        boolean isSolidaritePayee = membre.getSolidaritePayee() != null && membre.getSolidaritePayee();

        if (!isInscriptionPayee && !isSolidaritePayee) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message("Votre inscription et votre cotisation de solidarité ne sont pas encore à jour.")
                    .build();
        }
        if (!isInscriptionPayee) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message("Votre droit d'inscription n'est pas encore soldé.")
                    .build();
        }
        if (!isSolidaritePayee) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message("Votre cotisation de solidarité n'est pas encore soldée.")
                    .build();
        }

        return EligibilityResponse.builder()
                .eligible(true)
                .message("Vous êtes éligible pour demander une aide.")
                .build();
    }

    public List<ParametresAide> obtenirRaisonsAidesExistantes() {
        return parametresAideRepository.findAll();
    }

    public List<Sortie> obtenirSortiesDuMembre(String membreId) {
        return sortieRepository.findByMembreId(membreId);
    }

    public List<Pret> obtenirPretsDuMembre(String membreId) {
        return pretRepository.findByMembreIdOrderByDatePretDesc(membreId);
    }

    public List<Sortie> obtenirToutesSorties() {
        return sortieRepository.findAllByOrderByDateSortieDesc();
    }

    public List<Sortie> obtenirSortiesEnAttenteSg() {
        return sortieRepository.findByStatutOrderByDateSortieDesc(StatutSortie.en_attente_secretaire_general);
    }

    public List<Sortie> obtenirSortiesEnAttenteTr() {
        return sortieRepository.findByStatutOrderByDateSortieDesc(StatutSortie.en_attente_tresorier);
    }

    @Transactional
    public Sortie demanderAide(String membreId, String typeAide) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        EligibilityResponse eligibility = verifierEligibiliteAide(membreId);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Demande d'aide impossible. " + eligibility.getMessage());
        }

        ParametresAide aideParam = parametresAideRepository.findByTypeAide(typeAide)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Le type d'aide sélectionné n'est pas disponible. Choisissez une autre option."));

        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        BigDecimal caisseSolidarite = parametres.getCaisseSolidarites() != null ? parametres.getCaisseSolidarites() : BigDecimal.ZERO;

        if (caisseSolidarite.compareTo(aideParam.getMontant()) < 0) {
            throw new IllegalStateException(
                    "Fonds insuffisants dans la caisse de solidarité pour accorder cette aide ("
                            + formatMontant(aideParam.getMontant())
                            + "). Disponible actuellement : "
                            + formatMontant(caisseSolidarite)
                            + ". Réessayez plus tard ou contactez le bureau.");
        }

        Membre membre = membreRepository.findById(membreId).orElseThrow();

        Sortie sortie = Sortie.builder()
                .montant(aideParam.getMontant())
                .membre(membre)
                .exercice(exercice)
                .raison("aide_" + typeAide)
                .statut(StatutSortie.en_attente_secretaire_general)
                .build();

        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - CRÉATION] Nouvelle demande d'aide créée pour le membre {} (type: {}, montant: {}). Statut initial: {}",
                membre.getCouriel(), typeAide, aideParam.getMontant(), saved.getStatut());

        return saved;
    }

    public EligibilityResponse verifierEligibilitePret(String membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        Integer facteurEmprunt = parametres.getFacteurEmprunt();
        BigDecimal montantMaximum = calculerMontantMaximumPret(membre, facteurEmprunt);

        boolean isInscriptionPayee = membre.getInscriptionPayee() != null && membre.getInscriptionPayee();
        boolean isSolidaritePayee = membre.getSolidaritePayee() != null && membre.getSolidaritePayee();
        boolean isDetteSolidariteNulle = membre.getDetteSolidarite() == null || membre.getDetteSolidarite().compareTo(BigDecimal.ZERO) == 0;
        boolean isDetteInscriptionNulle = membre.getDetteInscription() == null || membre.getDetteInscription().compareTo(BigDecimal.ZERO) == 0;

        boolean hasNoUnpaidLoan = membre.getDette() == null || membre.getDette().compareTo(BigDecimal.ZERO) == 0;

        StringBuilder reason = new StringBuilder();
        if (!isInscriptionPayee) {
            reason.append("Votre droit d'inscription n'est pas encore soldé. ");
        }
        if (!isSolidaritePayee) {
            reason.append("Votre cotisation de solidarité n'est pas encore soldée. ");
        }
        if (!isDetteSolidariteNulle) {
            reason.append("Il reste un solde de solidarité à régler. ");
        }
        if (!isDetteInscriptionNulle) {
            reason.append("Il reste un solde d'inscription à régler. ");
        }
        if (!hasNoUnpaidLoan) {
            reason.append("Vous avez déjà un emprunt non remboursé. ");
        }

        if (reason.length() > 0) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message(reason.toString().trim())
                    .montantMaximum(montantMaximum)
                    .facteurEmprunt(facteurEmprunt)
                    .build();
        }

        return EligibilityResponse.builder()
                .eligible(true)
                .message("Vous êtes éligible pour demander un emprunt.")
                .montantMaximum(montantMaximum)
                .facteurEmprunt(facteurEmprunt)
                .build();
    }

    /**
     * Montant maximum = épargne du membre × facteur d'emprunt (paramètres généraux).
     */
    private BigDecimal calculerMontantMaximumPret(Membre membre, Integer facteurEmprunt) {
        BigDecimal epargneActuelle = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;
        int facteur = facteurEmprunt != null ? facteurEmprunt : 0;
        return epargneActuelle.multiply(BigDecimal.valueOf(facteur));
    }

    @Transactional
    public Sortie demanderPret(String membreId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        EligibilityResponse eligibility = verifierEligibilitePret(membreId);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Emprunt impossible. " + eligibility.getMessage());
        }

        Membre membre = membreRepository.findById(membreId).orElseThrow();
        ParametresGeneraux parametres = parametresGenerauxService.getParametres();

        BigDecimal maxPret = calculerMontantMaximumPret(membre, parametres.getFacteurEmprunt());
        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant de l'emprunt doit être supérieur à 0 FCFA.");
        }

        if (montant.compareTo(maxPret) > 0) {
            throw new IllegalStateException(
                    "Montant trop élevé : votre capacité d'emprunt maximale est de "
                            + formatMontant(maxPret)
                            + " (épargne × facteur d'emprunt).");
        }

        BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;
        if (caisseEpargnes.compareTo(montant) < 0) {
            throw new IllegalStateException(
                    "Fonds insuffisants dans la caisse d'épargne pour accorder cet emprunt ("
                            + formatMontant(montant)
                            + "). Disponible actuellement : "
                            + formatMontant(caisseEpargnes)
                            + ". Réessayez plus tard ou contactez le bureau.");
        }

        Sortie sortie = Sortie.builder()
                .montant(montant)
                .membre(membre)
                .exercice(exercice)
                .raison("pret")
                .statut(StatutSortie.en_attente_secretaire_general)
                .build();

        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - CRÉATION PRÊT] Nouvelle demande de prêt créée pour le membre {} (montant: {}). Statut initial: {}",
                membre.getCouriel(), montant, saved.getStatut());

        return saved;
    }

    @Transactional
    public Sortie demanderRetrait(String membreId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre introuvable."));

        BigDecimal epargneActuelle = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du retrait doit être supérieur à 0 FCFA.");
        }

        if (montant.compareTo(epargneActuelle) > 0) {
            throw new IllegalStateException(
                    "Montant trop élevé : votre épargne disponible est de "
                            + formatMontant(epargneActuelle)
                            + ".");
        }

        Sortie sortie = Sortie.builder()
                .montant(montant)
                .membre(membre)
                .exercice(exercice)
                .raison("retrait")
                .statut(StatutSortie.en_attente_secretaire_general)
                .build();

        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - CRÉATION RETRAIT] Nouvelle demande de retrait créée pour le membre {} (montant: {}). Statut initial: {}",
                membre.getCouriel(), montant, saved.getStatut());

        return saved;
    }

    @Transactional
    public Sortie accepterSg(String sortieId) {
        exerciceService.requireExerciceEnCours();
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_secretaire_general) {
            throw new IllegalStateException("Impossible d'accepter par le Secrétaire Général. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.en_attente_tresorier);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - VALIDATION SG] La demande d'aide {} a été acceptée par le SG. Statut actuel: {}",
                sortieId, saved.getStatut());
        return saved;
    }

    @Transactional
    public Sortie refuserSg(String sortieId) {
        exerciceService.requireExerciceEnCours();
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_secretaire_general) {
            throw new IllegalStateException("Impossible de refuser par le Secrétaire Général. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.refuse_par_sg_refuse_par_tr);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - REFUS SG] La demande d'aide {} a été refusée par le SG. Statut actuel: {}",
                sortieId, saved.getStatut());
        return saved;
    }

    @Transactional
    public Sortie accepterTr(String sortieId) {
        exerciceService.requireExerciceEnCours();
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_tresorier) {
            throw new IllegalStateException("Impossible d'accepter par le Trésorier. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.accepte_par_sg_accepte_par_tr);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - VALIDATION TRÉSO] La sortie {} a été acceptée par le Trésorier. Statut actuel: {}",
                sortieId, saved.getStatut());

        // Pour un emprunt, la séquence s'arrête ici : décaissement + enregistrement du prêt.
        if (saved.getRaison() != null && "pret".equals(saved.getRaison())) {
            finaliserEmprunt(saved);
        }

        return saved;
    }

    @Transactional
    public Sortie refuserTr(String sortieId) {
        exerciceService.requireExerciceEnCours();
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_tresorier) {
            throw new IllegalStateException("Impossible de refuser par le Trésorier. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.accepte_par_sg_refuse_par_tr);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - REFUS TRÉSO] La sortie {} a été refusée par le Trésorier. Statut actuel: {}",
                sortieId, saved.getStatut());
        return saved;
    }

    /**
     * Effets métier d'un emprunt validé par le trésorier :
     * caisse épargnes, table prets, dette membre, répartition des intérêts.
     */
    private void finaliserEmprunt(Sortie sortie) {
        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;

        BigDecimal montantPret = sortie.getMontant();
        BigDecimal tauxInteret = parametres.getTauxInteretEmprunts();
        BigDecimal interets = montantPret.multiply(tauxInteret).setScale(0, RoundingMode.DOWN);

        BigDecimal montantADeduire = montantPret.subtract(interets);
        parametres.setCaisseEpargnes(caisseEpargnes.subtract(montantADeduire));
        parametresGenerauxRepository.save(parametres);
        log.info("[EMPRUNT - CAISSE] {} retiré (intérêts déduits {}) de la caisse d'épargne. Nouveau solde: {}",
                montantPret, interets, parametres.getCaisseEpargnes());

        LocalDateTime dateEcheance = LocalDateTime.now().plusMonths(parametres.getDureeMaximaleEmprunt());
        // Le membre rembourse uniquement le capital prêté (les intérêts sont redistribués aux épargnants).
        BigDecimal montantARembourser = montantPret;

        List<Membre> tousMembres = membreRepository.findAll();
        BigDecimal totalEpargneAutres = BigDecimal.ZERO;
        List<Membre> beneficiaires = new ArrayList<>();
        for (Membre m : tousMembres) {
            if (!m.getId().equals(sortie.getMembre().getId())
                    && m.getEpargne() != null
                    && m.getEpargne().compareTo(BigDecimal.ZERO) > 0) {
                totalEpargneAutres = totalEpargneAutres.add(m.getEpargne());
                beneficiaires.add(m);
            }
        }

        Map<String, BigDecimal> listeCreatiers = new LinkedHashMap<>();
        if (totalEpargneAutres.compareTo(BigDecimal.ZERO) > 0) {
            for (Membre m : beneficiaires) {
                BigDecimal part = m.getEpargne().divide(totalEpargneAutres, 15, RoundingMode.HALF_UP);
                listeCreatiers.put(m.getId(), part);
            }
        }

        Pret newPret = Pret.builder()
                .id(java.util.UUID.randomUUID().toString())
                .montant(montantPret)
                .datePret(LocalDateTime.now())
                .membre(sortie.getMembre())
                .exercice(sortie.getExercice())
                .raison("Emprunt")
                .montantARembourser(montantARembourser)
                .dateEcheance(dateEcheance)
                .statut("non rembourse")
                .listeCreatiers(listeCreatiers)
                .build();
        pretRepository.save(newPret);
        log.info("[EMPRUNT - ENREGISTREMENT] Emprunt de {} créé pour {}, à rembourser (capital): {}, échéance: {}, créanciers: {}",
                montantPret, sortie.getMembre().getCouriel(), montantARembourser, dateEcheance, listeCreatiers);

        Membre emprunteur = sortie.getMembre();
        BigDecimal detteActuelle = emprunteur.getDette() != null ? emprunteur.getDette() : BigDecimal.ZERO;
        emprunteur.setDette(detteActuelle.add(montantPret));
        membreRepository.save(emprunteur);
        log.info("[EMPRUNT - DETTE] Dette du membre {} mise à jour : {}",
                emprunteur.getCouriel(), emprunteur.getDette());

        if (totalEpargneAutres.compareTo(BigDecimal.ZERO) > 0) {
            for (Membre m : beneficiaires) {
                BigDecimal part = listeCreatiers.get(m.getId());
                BigDecimal partInteret = part.multiply(interets).setScale(2, RoundingMode.HALF_UP);
                BigDecimal currentInteret = m.getInteret() != null ? m.getInteret() : BigDecimal.ZERO;
                m.setInteret(currentInteret.add(partInteret));
                membreRepository.save(m);
                log.info("[EMPRUNT - RÉPARTITION INTÉRÊT] {} ajouté aux intérêts du membre {} (part: {})",
                        partInteret, m.getCouriel(), part);
            }
        }
    }

    @Transactional
    public Sortie confirmerMembre(String sortieId) {
        exerciceService.requireExerciceEnCours();
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getRaison() != null && "pret".equals(sortie.getRaison())) {
            throw new IllegalStateException(
                    "La confirmation du membre n'est plus requise pour un emprunt. "
                            + "L'emprunt est finalisé dès la validation du trésorier.");
        }

        if (sortie.getStatut() != StatutSortie.accepte_par_sg_accepte_par_tr) {
            throw new IllegalStateException("Impossible de confirmer la réception. La sortie doit être acceptée par le SG et le Trésorier. Statut actuel: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.recue_par_membre);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - CONFIRMATION MEMBRE] Le membre a confirmé la réception de la sortie {}. Statut actuel: {}",
                sortieId, saved.getStatut());

        if (sortie.getRaison() != null && sortie.getRaison().startsWith("aide_")) {
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseSolidarite = parametres.getCaisseSolidarites() != null ? parametres.getCaisseSolidarites() : BigDecimal.ZERO;
            parametres.setCaisseSolidarites(caisseSolidarite.subtract(sortie.getMontant()));
            parametresGenerauxRepository.save(parametres);
            log.info("[SORTIE - MISE À JOUR CAISSE] Montant de {} retiré de la caisse de solidarité. Nouveau solde caisse: {}",
                    sortie.getMontant(), parametres.getCaisseSolidarites());
        } else if (sortie.getRaison() != null && "retrait".equals(sortie.getRaison())) {
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;

            BigDecimal montantRetrait = sortie.getMontant();
            parametres.setCaisseEpargnes(caisseEpargnes.subtract(montantRetrait));
            parametresGenerauxRepository.save(parametres);
            log.info("[SORTIE - MISE À JOUR CAISSE RETRAIT] Retrait : {} retiré de la caisse d'épargne. Nouveau solde caisse: {}",
                    montantRetrait, parametres.getCaisseEpargnes());

            Membre membre = sortie.getMembre();
            BigDecimal epargneInitiale = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;
            BigDecimal interetInitial = membre.getInteret() != null ? membre.getInteret() : BigDecimal.ZERO;

            BigDecimal nouveauEpargne = epargneInitiale.subtract(montantRetrait);
            BigDecimal nouveauInteret = BigDecimal.ZERO;
            if (epargneInitiale.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal part = montantRetrait.divide(epargneInitiale, 15, RoundingMode.HALF_UP);
                BigDecimal diminutionInterets = interetInitial.multiply(part);
                nouveauInteret = interetInitial.subtract(diminutionInterets);
                if (nouveauInteret.compareTo(BigDecimal.ZERO) < 0) {
                    nouveauInteret = BigDecimal.ZERO;
                }
            }

            membre.setEpargne(nouveauEpargne);
            membre.setInteret(nouveauInteret.setScale(2, RoundingMode.HALF_UP));
            membreRepository.save(membre);
            log.info("[SORTIE - RETRAIT MEMBRE] Membre {} : nouveau solde épargne = {}, nouveau solde intérêt = {}",
                    membre.getCouriel(), membre.getEpargne(), membre.getInteret());
        }

        return saved;
    }
}
