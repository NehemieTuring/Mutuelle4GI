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
import java.util.List;

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
    private ExerciceRepository exerciceRepository;

    private void checkActiveExercice() {
        if (exerciceRepository.findByStatut("en cours").isEmpty()) {
            throw new IllegalStateException("Aucun exercice en cours. Opération impossible.");
        }
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
                    .message("L'inscription et la solidarité ne sont pas payées")
                    .build();
        }
        if (!isInscriptionPayee) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message("L'inscription n'est pas payée")
                    .build();
        }
        if (!isSolidaritePayee) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message("La solidarité n'est pas payée")
                    .build();
        }

        return EligibilityResponse.builder()
                .eligible(true)
                .message("Le membre est éligible à demander une aide")
                .build();
    }

    public List<ParametresAide> obtenirRaisonsAidesExistantes() {
        return parametresAideRepository.findAll();
    }

    @Transactional
    public Sortie demanderAide(String membreId, String typeAide) {
        checkActiveExercice();
        EligibilityResponse eligibility = verifierEligibiliteAide(membreId);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Le membre ne peut pas solliciter une aide car : " + eligibility.getMessage());
        }

        ParametresAide aideParam = parametresAideRepository.findByTypeAide(typeAide)
                .orElseThrow(() -> new IllegalArgumentException("Le type d'aide '" + typeAide + "' n'existe pas"));

        ParametresGeneraux parametres = parametresGenerauxService.getParametres();
        BigDecimal caisseSolidarite = parametres.getCaisseSolidarites() != null ? parametres.getCaisseSolidarites() : BigDecimal.ZERO;

        if (caisseSolidarite.compareTo(aideParam.getMontant()) < 0) {
            throw new IllegalStateException("Le membre ne peut pas bénéficier de l'aide car il n'y a pas assez de liquidités dans la caisse de solidarités");
        }

        Membre membre = membreRepository.findById(membreId).orElseThrow();

        Sortie sortie = Sortie.builder()
                .montant(aideParam.getMontant())
                .membre(membre)
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

        boolean isInscriptionPayee = membre.getInscriptionPayee() != null && membre.getInscriptionPayee();
        boolean isSolidaritePayee = membre.getSolidaritePayee() != null && membre.getSolidaritePayee();
        boolean isDetteSolidariteNulle = membre.getDetteSolidarite() == null || membre.getDetteSolidarite().compareTo(BigDecimal.ZERO) == 0;
        boolean isDetteInscriptionNulle = membre.getDetteInscription() == null || membre.getDetteInscription().compareTo(BigDecimal.ZERO) == 0;

        boolean hasNoUnpaidLoan = membre.getDette() == null || membre.getDette().compareTo(BigDecimal.ZERO) == 0;

        StringBuilder reason = new StringBuilder();
        if (!isInscriptionPayee) {
            reason.append("L'inscription n'est pas payée. ");
        }
        if (!isSolidaritePayee) {
            reason.append("La solidarité n'est pas payée. ");
        }
        if (!isDetteSolidariteNulle) {
            reason.append("La dette de solidarité n'est pas nulle. ");
        }
        if (!isDetteInscriptionNulle) {
            reason.append("La dette d'inscription n'est pas nulle. ");
        }
        if (!hasNoUnpaidLoan) {
            reason.append("Le membre a un emprunt non remboursé. ");
        }

        if (reason.length() > 0) {
            return EligibilityResponse.builder()
                    .eligible(false)
                    .message(reason.toString().trim())
                    .build();
        }

        return EligibilityResponse.builder()
                .eligible(true)
                .message("Le membre est éligible à demander un prêt")
                .build();
    }

    @Transactional
    public Sortie demanderPret(String membreId, BigDecimal montant) {
        checkActiveExercice();
        EligibilityResponse eligibility = verifierEligibilitePret(membreId);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Le membre ne peut pas solliciter un prêt car : " + eligibility.getMessage());
        }

        Membre membre = membreRepository.findById(membreId).orElseThrow();
        ParametresGeneraux parametres = parametresGenerauxService.getParametres();

        BigDecimal epargneActuelle = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;
        BigDecimal maxPret = epargneActuelle.multiply(new BigDecimal(parametres.getFacteurEmprunt()));

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du prêt doit être strictement positif");
        }

        if (montant.compareTo(maxPret) > 0) {
            throw new IllegalStateException("Le montant demandé (" + montant + ") dépasse la limite autorisée (" + maxPret + ")");
        }

        BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;
        if (caisseEpargnes.compareTo(montant) < 0) {
            throw new IllegalStateException("Le membre ne peut pas bénéficier du prêt car il n'y a pas assez de liquidités dans la caisse des épargnes");
        }

        Sortie sortie = Sortie.builder()
                .montant(montant)
                .membre(membre)
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
        checkActiveExercice();
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        BigDecimal epargneActuelle = membre.getEpargne() != null ? membre.getEpargne() : BigDecimal.ZERO;

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du retrait doit être strictement positif");
        }

        if (montant.compareTo(epargneActuelle) > 0) {
            throw new IllegalStateException("Le membre ne peut pas retirer cette somme car le montant demandé (" + montant + ") dépasse son épargne actuelle (" + epargneActuelle + ")");
        }

        Sortie sortie = Sortie.builder()
                .montant(montant)
                .membre(membre)
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
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_tresorier) {
            throw new IllegalStateException("Impossible d'accepter par le Trésorier. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.accepte_par_sg_accepte_par_tr);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - VALIDATION TRÉSO] La demande d'aide {} a été acceptée par le Trésorier. Statut actuel: {}",
                sortieId, saved.getStatut());
        return saved;
    }

    @Transactional
    public Sortie refuserTr(String sortieId) {
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

        if (sortie.getStatut() != StatutSortie.en_attente_tresorier) {
            throw new IllegalStateException("Impossible de refuser par le Trésorier. Statut actuel invalide: " + sortie.getStatut());
        }

        sortie.setStatut(StatutSortie.accepte_par_sg_refuse_par_tr);
        Sortie saved = sortieRepository.save(sortie);
        log.info("[SORTIE - REFUS TRÉSO] La demande d'aide {} a été refusée par le Trésorier. Statut actuel: {}",
                sortieId, saved.getStatut());
        return saved;
    }

    @Transactional
    public Sortie confirmerMembre(String sortieId) {
        Sortie sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new IllegalArgumentException("Sortie avec l'id " + sortieId + " n'existe pas"));

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
        } else if (sortie.getRaison() != null && "pret".equals(sortie.getRaison())) {
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseEpargnes = parametres.getCaisseEpargnes() != null ? parametres.getCaisseEpargnes() : BigDecimal.ZERO;
            
            // 1. Calculer les intérêts sur le prêt
            BigDecimal montantPret = sortie.getMontant();
            BigDecimal tauxInteret = parametres.getTauxInteretEmprunts();
            BigDecimal interets = montantPret.multiply(tauxInteret).setScale(0, RoundingMode.DOWN);

            // 2. Diminuer la caisse d'épargne du montant de l'emprunt auquel on soustrait les intérêts
            BigDecimal montantADeduire = montantPret.subtract(interets);
            parametres.setCaisseEpargnes(caisseEpargnes.subtract(montantADeduire));
            parametresGenerauxRepository.save(parametres);
            log.info("[SORTIE - MISE À JOUR CAISSE] Prêt : {} retiré (avec interêts déduits {}) de la caisse d'épargne. Nouveau solde caisse: {}",
                    montantPret, interets, parametres.getCaisseEpargnes());

            // 3. Enregistrer l'emprunt dans la table des prets
            LocalDateTime dateEcheance = LocalDateTime.now().plusMonths(parametres.getDureeMaximaleEmprunt());
            BigDecimal montantARembourser = montantPret.add(interets);
            Pret newPret = Pret.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .montant(montantPret)
                    .datePret(LocalDateTime.now())
                    .membre(sortie.getMembre())
                    .raison("Emprunt")
                    .montantARembourser(montantARembourser)
                    .dateEcheance(dateEcheance)
                    .statut("non rembourse")
                    .build();
            pretRepository.save(newPret);
            log.info("[SORTIE - ENREGISTREMENT EMPRUNT] Emprunt de {} créé pour le membre {}, montant à rembourser: {}, échéance: {}",
                    montantPret, sortie.getMembre().getCouriel(), montantARembourser, dateEcheance);

            // Mettre à jour le champ dette du membre
            Membre emprunteur = sortie.getMembre();
            BigDecimal detteActuelle = emprunteur.getDette() != null ? emprunteur.getDette() : BigDecimal.ZERO;
            emprunteur.setDette(detteActuelle.add(montantARembourser));
            membreRepository.save(emprunteur);
            log.info("[SORTIE - ENREGISTREMENT EMPRUNT] Dette du membre {} mise à jour : {}",
                    emprunteur.getCouriel(), emprunteur.getDette());

            // 4. Répartir l'intérêt entre les membres qui ont un épargne non nul (sauf l'emprunteur)
            List<Membre> tousMembres = membreRepository.findAll();
            BigDecimal totalEpargneAutres = BigDecimal.ZERO;
            List<Membre> beneficiaires = new ArrayList<>();
            for (Membre m : tousMembres) {
                if (!m.getId().equals(sortie.getMembre().getId()) && m.getEpargne() != null && m.getEpargne().compareTo(BigDecimal.ZERO) > 0) {
                    totalEpargneAutres = totalEpargneAutres.add(m.getEpargne());
                    beneficiaires.add(m);
                }
            }

            if (totalEpargneAutres.compareTo(BigDecimal.ZERO) > 0) {
                for (Membre m : beneficiaires) {
                    BigDecimal part = m.getEpargne().divide(totalEpargneAutres, 15, RoundingMode.HALF_UP);
                    BigDecimal partInteret = part.multiply(interets).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal currentInteret = m.getInteret() != null ? m.getInteret() : BigDecimal.ZERO;
                    m.setInteret(currentInteret.add(partInteret));
                    membreRepository.save(m);
                    log.info("[EMPRUNT - RÉPARTITION INTÉRÊT] {} ajouté aux intérêts du membre {}", partInteret, m.getCouriel());
                }
            }
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
