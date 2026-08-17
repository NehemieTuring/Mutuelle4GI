package com.mutuelle.api.service;

import com.mutuelle.api.entity.*;
import com.mutuelle.api.repository.MembreRepository;
import com.mutuelle.api.repository.ParametresGenerauxRepository;
import com.mutuelle.api.repository.VersementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class VersementService {

    private static final Logger log = LoggerFactory.getLogger(VersementService.class);

    @Autowired
    private VersementRepository versementRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private ParametresGenerauxService parametresGenerauxService;

    @Autowired
    private ParametresGenerauxRepository parametresGenerauxRepository;

    @Autowired
    private ExerciceService exerciceService;

    public Versement demanderInscription(String membreId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        BigDecimal montantRequis = membre.getDetteInscription();
        if (montantRequis == null) {
            montantRequis = BigDecimal.ZERO;
        }
        if (montantRequis.compareTo(BigDecimal.ZERO) <= 0 || Boolean.TRUE.equals(membre.getInscriptionPayee())) {
            throw new IllegalArgumentException("L'inscription de ce membre est déjà soldée.");
        }

        if (montant == null || montant.compareTo(montantRequis) != 0) {
            throw new IllegalArgumentException("Le montant reçu ne correspond pas au reste d'inscription dû (" + montantRequis + ")");
        }

        Versement versement = Versement.builder()
                .montant(montant)
                .membre(membre)
                .exercice(exercice)
                .raison(RaisonVersement.inscription)
                .statut(StatutVersement.en_attente)
                .description("Paiement de l'inscription")
                .build();

        Versement saved = versementRepository.save(versement);

        log.info("[NOTIFICATION - TRESORIER] Nouveau versement d'inscription créé en attente de validation pour le membre {} (ID: {}). Montant: {}",
                membre.getCouriel(), membre.getId(), montant);

        return saved;
    }

    public Versement demanderSolidarite(String membreId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant doit être supérieur à zéro");
        }

        BigDecimal detteActuelle = membre.getDetteSolidarite();
        if (detteActuelle == null) {
            detteActuelle = BigDecimal.ZERO;
        }

        if (montant.compareTo(detteActuelle) > 0) {
            throw new IllegalArgumentException("Le montant du versement (" + montant + ") dépasse la dette de solidarité actuelle (" + detteActuelle + ")");
        }

        Versement versement = Versement.builder()
                .montant(montant)
                .membre(membre)
                .exercice(exercice)
                .raison(RaisonVersement.solidarite)
                .statut(StatutVersement.en_attente)
                .description("Paiement de la solidarité")
                .build();

        Versement saved = versementRepository.save(versement);

        log.info("[NOTIFICATION - TRESORIER] Nouveau versement de solidarité créé en attente de validation pour le membre {} (ID: {}). Montant: {}",
                membre.getCouriel(), membre.getId(), montant);

        return saved;
    }

    public Versement demanderEpargne(String membreId, BigDecimal montant) {
        Exercice exercice = exerciceService.requireExerciceEnCours();
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new IllegalArgumentException("Membre avec l'id " + membreId + " n'existe pas"));

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant doit être supérieur à zéro");
        }

        Versement versement = Versement.builder()
                .montant(montant)
                .membre(membre)
                .exercice(exercice)
                .raison(RaisonVersement.epargne)
                .statut(StatutVersement.en_attente)
                .description("Versement d'épargne")
                .build();

        Versement saved = versementRepository.save(versement);

        log.info("[NOTIFICATION - TRESORIER] Nouveau versement d'épargne créé en attente de validation pour le membre {} (ID: {}). Montant: {}",
                membre.getCouriel(), membre.getId(), montant);

        return saved;
    }

    public List<Versement> obtenirVersementsEnAttente() {
        return versementRepository.findByStatut(StatutVersement.en_attente);
    }

    public List<Versement> obtenirTousVersements() {
        return versementRepository.findAll();
    }

    public List<Versement> obtenirVersementsParRaison(RaisonVersement raison) {
        return versementRepository.findByRaisonOrderByDateVersementDesc(raison);
    }

    public List<Versement> obtenirVersementsDuMembre(String membreId) {
        return versementRepository.findByMembreIdOrderByDateVersementDesc(membreId);
    }

    public List<Versement> obtenirVersementsDuMembreParRaison(String membreId, RaisonVersement raison) {
        return versementRepository.findByMembreIdAndRaisonOrderByDateVersementDesc(membreId, raison);
    }

    public Versement accepterVersement(String versementId) {
        exerciceService.requireExerciceEnCours();
        Versement versement = versementRepository.findById(versementId)
                .orElseThrow(() -> new IllegalArgumentException("Versement avec l'id " + versementId + " n'existe pas"));

        if (versement.getStatut() != StatutVersement.en_attente) {
            throw new IllegalStateException("Le versement n'est pas en attente, statut actuel : " + versement.getStatut());
        }

        versement.setStatut(StatutVersement.accepte);
        Versement saved = versementRepository.save(versement);

        if (versement.getRaison() == RaisonVersement.inscription) {
            // Mettre à jour le champ 'dette_inscription' du membre en soustrayant le montant du versement
            Membre membre = versement.getMembre();
            BigDecimal detteActuelle = membre.getDetteInscription();
            if (detteActuelle == null) {
                detteActuelle = BigDecimal.ZERO;
            }
            BigDecimal detteRestante = detteActuelle.subtract(versement.getMontant());
            if (detteRestante.compareTo(BigDecimal.ZERO) < 0) {
                detteRestante = BigDecimal.ZERO;
            }
            membre.setDetteInscription(detteRestante);
            if (detteRestante.compareTo(BigDecimal.ZERO) == 0) {
                membre.setInscriptionPayee(true);
            }
            // Recalcule etat (dette solidarité) + persiste inscriptionPayee / detteInscription
            membre.mettreAJourEtat();
            membreRepository.save(membre);

            // Mettre à jour le montant dans la caisse des inscriptions (montant existant + montant du versement)
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseActuelle = parametres.getCaisseInscriptions();
            if (caisseActuelle == null) {
                caisseActuelle = BigDecimal.ZERO;
            }
            parametres.setCaisseInscriptions(caisseActuelle.add(versement.getMontant()));
            parametresGenerauxRepository.save(parametres);

            log.info("[NOTIFICATION - TRESORIER] Versement d'inscription d'un montant de {} accepté pour le membre {}. L'inscription est marquée comme payée et la caisse a été mise à jour.",
                    versement.getMontant(), membre.getCouriel());
        } else if (versement.getRaison() == RaisonVersement.solidarite) {
            // Mettre à jour le champ 'dette_solidarite' du membre en soustrayant le montant du versement
            Membre membre = versement.getMembre();
            BigDecimal detteActuelle = membre.getDetteSolidarite();
            if (detteActuelle == null) {
                detteActuelle = BigDecimal.ZERO;
            }
            BigDecimal detteRestante = detteActuelle.subtract(versement.getMontant());
            if (detteRestante.compareTo(BigDecimal.ZERO) < 0) {
                detteRestante = BigDecimal.ZERO;
            }
            membre.setDetteSolidarite(detteRestante);
            if (detteRestante.compareTo(BigDecimal.ZERO) == 0) {
                membre.setSolidaritePayee(true);
            }
            membre.mettreAJourEtat();
            membreRepository.save(membre);

            // Mettre à jour le montant dans la caisse des solidarités (montant existant + montant du versement)
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseActuelle = parametres.getCaisseSolidarites();
            if (caisseActuelle == null) {
                caisseActuelle = BigDecimal.ZERO;
            }
            parametres.setCaisseSolidarites(caisseActuelle.add(versement.getMontant()));
            parametresGenerauxRepository.save(parametres);

            log.info("[NOTIFICATION - TRESORIER] Versement de solidarité d'un montant de {} accepté pour le membre {}. Dette restante: {}. Caisse solidarité mise à jour.",
                    versement.getMontant(), membre.getCouriel(), detteRestante);
        } else if (versement.getRaison() == RaisonVersement.epargne) {
            // Mettre à jour le champ 'epargne' du membre en ajoutant le montant du versement
            Membre membre = versement.getMembre();
            BigDecimal epargneActuelle = membre.getEpargne();
            if (epargneActuelle == null) {
                epargneActuelle = BigDecimal.ZERO;
            }
            membre.setEpargne(epargneActuelle.add(versement.getMontant()));
            membreRepository.save(membre);

            // Mettre à jour le montant dans la caisse des epargnes (montant existant + montant du versement)
            ParametresGeneraux parametres = parametresGenerauxService.getParametres();
            BigDecimal caisseActuelle = parametres.getCaisseEpargnes();
            if (caisseActuelle == null) {
                caisseActuelle = BigDecimal.ZERO;
            }
            parametres.setCaisseEpargnes(caisseActuelle.add(versement.getMontant()));
            parametresGenerauxRepository.save(parametres);

            log.info("[NOTIFICATION - TRESORIER] Versement d'épargne d'un montant de {} accepté pour le membre {}. Épargne totale: {}. Caisse épargnes mise à jour.",
                    versement.getMontant(), membre.getCouriel(), membre.getEpargne());
        } else {
            log.info("[NOTIFICATION - TRESORIER] Versement accepté pour la raison {} (Montant: {})", versement.getRaison(), versement.getMontant());
        }

        return saved;
    }

    public Versement refuserVersement(String versementId) {
        exerciceService.requireExerciceEnCours();
        Versement versement = versementRepository.findById(versementId)
                .orElseThrow(() -> new IllegalArgumentException("Versement avec l'id " + versementId + " n'existe pas"));

        if (versement.getStatut() != StatutVersement.en_attente) {
            throw new IllegalStateException("Le versement n'est pas en attente, statut actuel : " + versement.getStatut());
        }

        versement.setStatut(StatutVersement.refuse);
        Versement saved = versementRepository.save(versement);

        log.info("[NOTIFICATION - TRESORIER] Versement refusé pour le membre {}. Raison: {}, Montant: {}",
                versement.getMembre().getCouriel(), versement.getRaison(), versement.getMontant());

        return saved;
    }
}
