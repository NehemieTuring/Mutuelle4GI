package com.mutuelle.api;

import com.mutuelle.api.dto.CreateMembreRequest;
import com.mutuelle.api.entity.*;
import com.mutuelle.api.repository.MembreRepository;
import com.mutuelle.api.repository.ParametresGenerauxRepository;
import com.mutuelle.api.repository.VersementRepository;
import com.mutuelle.api.repository.PretRepository;
import com.mutuelle.api.service.MembreService;
import com.mutuelle.api.service.PasswordService;
import com.mutuelle.api.service.VersementService;
import com.mutuelle.api.service.SortieService;
import com.mutuelle.api.repository.SortieRepository;
import com.mutuelle.api.dto.EligibilityResponse;
import com.mutuelle.api.dto.SoldeTotalResponse;
import com.mutuelle.api.service.RemboursementService;
import com.mutuelle.api.repository.RemboursementRepository;
import com.mutuelle.api.repository.ExerciceRepository;
import com.mutuelle.api.service.ExerciceService;
import com.mutuelle.api.dto.ExerciceCreationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ApiApplicationTests {

    @Autowired
    private ParametresGenerauxRepository parametresGenerauxRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private VersementRepository versementRepository;

    @Autowired
    private PretRepository pretRepository;

    @Autowired
    private MembreService membreService;

    @Autowired
    private VersementService versementService;

    @Autowired
    private SortieService sortieService;

    @Autowired
    private SortieRepository sortieRepository;

    @Autowired
    private RemboursementService remboursementService;

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private com.mutuelle.api.repository.ParametresAideRepository parametresAideRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private ExerciceRepository exerciceRepository;

    @Autowired
    private ExerciceService exerciceService;

    @BeforeEach
    void setUp() {
        remboursementRepository.deleteAll();
        pretRepository.deleteAll();
        sortieRepository.deleteAll();
        versementRepository.deleteAll();
        membreRepository.deleteAll();
        parametresGenerauxRepository.deleteAll();
        parametresAideRepository.deleteAll();
        exerciceRepository.deleteAll();

        // Initialisation des paramètres généraux requis
        ParametresGeneraux params = ParametresGeneraux.builder()
                .montantInscription(new BigDecimal("50000.00"))
                .montantSolidarite(new BigDecimal("150000.00"))
                .tauxInteretEmprunts(new BigDecimal("0.0300"))
                .montantPenaliteRetard(new BigDecimal("15000.00"))
                .facteurEmprunt(5)
                .caisseInscriptions(BigDecimal.ZERO)
                .caisseSolidarites(BigDecimal.ZERO)
                .caisseEpargnes(BigDecimal.ZERO)
                .singletonGuard((byte) 1)
                .build();
        parametresGenerauxRepository.save(params);

        // Seeding assistance types
        parametresAideRepository
                .save(ParametresAide.builder().typeAide("deces").montant(new BigDecimal("500000.00")).build());
        parametresAideRepository
                .save(ParametresAide.builder().typeAide("maladie").montant(new BigDecimal("100000.00")).build());
        parametresAideRepository
                .save(ParametresAide.builder().typeAide("mariage").montant(new BigDecimal("50000.00")).build());

        // Seeding an open exercise by default so that other tests work
        Exercice defaultExercice = Exercice.builder()
                .id(UUID.randomUUID().toString())
                .dateOuverture(LocalDateTime.now())
                .statut("en cours")
                .build();
        exerciceRepository.save(defaultExercice);
    }

    @Test
    void testModifierMotDePasseEtVerifierCompte() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("KOUAMOU")
                .prenom("Edouard")
                .couriel("edouard.kouamou@univ-yaounde1.cm")
                .telephone("677106463")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Au départ, le compte n'est pas vérifié
        assertFalse(membre.getCompteVerifie());

        // Modification du mot de passe
        Membre updated = membreService.modifierMotDePasse(membre.getId(), "NouveauMotDePasse123!");

        // Le compte doit être marqué vérifié et le mot de passe mis à jour
        assertTrue(updated.getCompteVerifie());
        assertTrue(passwordService.matches("NouveauMotDePasse123!", updated.getMotDePasse()));
    }

    @Test
    void testDemanderInscriptionAvecMontantIncorrect() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("CHANA")
                .prenom("Anne Marie")
                .couriel("anne.chana@univ-yaounde1.cm")
                .telephone("675097283")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Tenter de payer 40000 au lieu de 50000 doit lancer une exception
        assertThrows(IllegalArgumentException.class, () -> {
            versementService.demanderInscription(membre.getId(), new BigDecimal("40000.00"));
        });
    }

    @Test
    void testDemanderInscriptionAvecMontantCorrect() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("BATCHAKUI")
                .prenom("Bernabé")
                .couriel("bernabe.batchakui@univ-yaounde1.cm")
                .telephone("677106463")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Payer le montant exact
        Versement versement = versementService.demanderInscription(membre.getId(), new BigDecimal("50000.00"));

        assertNotNull(versement.getId());
        assertEquals(StatutVersement.en_attente, versement.getStatut());
        assertEquals(RaisonVersement.inscription, versement.getRaison());
        assertEquals(new BigDecimal("50000.00"), versement.getMontant());
        assertEquals(membre.getId(), versement.getMembre().getId());
    }

    @Test
    void testAccepterVersementEtMettreAJourCaisse() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("DJOTIO")
                .prenom("Thomas")
                .couriel("thomas.djotio@univ-yaounde1.cm")
                .telephone("694554537")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Demander l'inscription
        Versement versement = versementService.demanderInscription(membre.getId(), new BigDecimal("50000.00"));

        // Vérifier les versements en attente
        List<Versement> enAttente = versementService.obtenirVersementsEnAttente();
        assertEquals(1, enAttente.size());

        // Accepter le versement
        Versement versementAccepte = versementService.accepterVersement(versement.getId());

        assertEquals(StatutVersement.accepte, versementAccepte.getStatut());

        // Le membre doit avoir l'inscription marquée comme payée
        Membre membreMisAJour = membreRepository.findById(membre.getId()).orElseThrow();
        assertTrue(membreMisAJour.getInscriptionPayee());

        // La caisse des inscriptions doit avoir augmenté de 50000.00
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, params.getCaisseInscriptions().compareTo(new BigDecimal("50000.00")));
    }

    @Test
    void testRefuserVersement() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("DJOTIO")
                .prenom("Thomas")
                .couriel("thomas.djotio@univ-yaounde1.cm")
                .telephone("694554537")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Demander l'inscription
        Versement versement = versementService.demanderInscription(membre.getId(), new BigDecimal("50000.00"));

        // Refuser le versement
        Versement versementRefuse = versementService.refuserVersement(versement.getId());

        assertEquals(StatutVersement.refuse, versementRefuse.getStatut());

        // Le membre ne doit pas avoir l'inscription payée
        Membre membreMisAJour = membreRepository.findById(membre.getId()).orElseThrow();
        assertFalse(membreMisAJour.getInscriptionPayee());

        // La caisse des inscriptions ne doit pas avoir augmenté
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, params.getCaisseInscriptions().compareTo(BigDecimal.ZERO));
    }

    @Test
    void testDemanderSolidariteValideEtInvalide() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("DJOTIO")
                .prenom("Thomas")
                .couriel("thomas.djotio@univ-yaounde1.cm")
                .telephone("694554537")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Au départ, sa dette de solidarité est de 150000.00
        assertEquals(0, membre.getDetteSolidarite().compareTo(new BigDecimal("150000.00")));
        assertFalse(membre.getSolidaritePayee());

        // Tenter de demander un versement supérieur à sa dette
        assertThrows(IllegalArgumentException.class, () -> {
            versementService.demanderSolidarite(membre.getId(), new BigDecimal("160000.00"));
        });

        // Tenter de demander un versement négatif
        assertThrows(IllegalArgumentException.class, () -> {
            versementService.demanderSolidarite(membre.getId(), new BigDecimal("-50.00"));
        });

        // Demander un montant valide inférieur au requis (ex: 50000.00)
        Versement versement = versementService.demanderSolidarite(membre.getId(), new BigDecimal("50000.00"));
        assertNotNull(versement.getId());
        assertEquals(StatutVersement.en_attente, versement.getStatut());
        assertEquals(RaisonVersement.solidarite, versement.getRaison());
        assertEquals(new BigDecimal("50000.00"), versement.getMontant());
    }

    @Test
    void testAccepterVersementSolidarite() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("DJOTIO")
                .prenom("Thomas")
                .couriel("thomas.djotio@univ-yaounde1.cm")
                .telephone("694554537")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Demander un premier paiement partiel de solidarité
        Versement v1 = versementService.demanderSolidarite(membre.getId(), new BigDecimal("50000.00"));
        versementService.accepterVersement(v1.getId());

        // Vérifier dette et caisse
        Membre m1 = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, m1.getDetteSolidarite().compareTo(new BigDecimal("100000.00")));
        assertFalse(m1.getSolidaritePayee());

        ParametresGeneraux params1 = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, params1.getCaisseSolidarites().compareTo(new BigDecimal("50000.00")));

        // Payer le reste (100000.00)
        Versement v2 = versementService.demanderSolidarite(membre.getId(), new BigDecimal("100000.00"));
        versementService.accepterVersement(v2.getId());

        // Vérifier dette à 0 et statut payé à true
        Membre m2 = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, m2.getDetteSolidarite().compareTo(BigDecimal.ZERO));
        assertTrue(m2.getSolidaritePayee());

        ParametresGeneraux params2 = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, params2.getCaisseSolidarites().compareTo(new BigDecimal("150000.00")));
    }

    @Test
    void testDemanderEtAccepterEpargne() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("DJOTIO")
                .prenom("Thomas")
                .couriel("thomas.djotio@univ-yaounde1.cm")
                .telephone("694554537")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Au départ, l'épargne est de 0
        assertEquals(0, membre.getEpargne().compareTo(BigDecimal.ZERO));

        // Tenter de demander une épargne négative ou nulle
        assertThrows(IllegalArgumentException.class, () -> {
            versementService.demanderEpargne(membre.getId(), BigDecimal.ZERO);
        });
        assertThrows(IllegalArgumentException.class, () -> {
            versementService.demanderEpargne(membre.getId(), new BigDecimal("-100.00"));
        });

        // Demander une épargne valide de 25000.00
        Versement versement = versementService.demanderEpargne(membre.getId(), new BigDecimal("25000.00"));
        assertNotNull(versement.getId());
        assertEquals(StatutVersement.en_attente, versement.getStatut());
        assertEquals(RaisonVersement.epargne, versement.getRaison());
        assertEquals(new BigDecimal("25000.00"), versement.getMontant());

        // Accepter le versement
        Versement versementAccepte = versementService.accepterVersement(versement.getId());
        assertEquals(StatutVersement.accepte, versementAccepte.getStatut());

        // Vérifier que l'épargne du membre a augmenté
        Membre membreMisAJour = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreMisAJour.getEpargne().compareTo(new BigDecimal("25000.00")));

        // Vérifier que la caisse des épargnes a augmenté
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, params.getCaisseEpargnes().compareTo(new BigDecimal("25000.00")));
    }

    @Test
    void testChangementEtatMembre() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("KOUAMOU")
                .prenom("Edouard")
                .couriel("edouard.kouamou@univ-yaounde1.cm")
                .telephone("699887766")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // Par défaut, dette_solidarite = 150000.00 (< 250000.00 et > 0) -> etat = "non
        // a jour"
        assertEquals("non a jour", membre.getEtat());

        // Mettre dette_solidarite >= 250000.00
        membre.setDetteSolidarite(new BigDecimal("250000.00"));
        Membre membreInactif = membreRepository.save(membre);
        assertEquals("Inactif", membreInactif.getEtat());

        // Mettre dette_solidarite à 100.00 (strictement positif, < 250000.00)
        membreInactif.setDetteSolidarite(new BigDecimal("100.00"));
        Membre membreNonAJour = membreRepository.save(membreInactif);
        assertEquals("non a jour", membreNonAJour.getEtat());

        // Mettre dette_solidarite à 0.00
        membreNonAJour.setDetteSolidarite(BigDecimal.ZERO);
        Membre membreAJour = membreRepository.save(membreNonAJour);
        assertEquals("a jour", membreAJour.getEtat());
    }

    @Test
    void testDemandeEtValidationAide() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("TCHOUAMOU")
                .prenom("David")
                .couriel("david.tchouamou@univ-yaounde1.cm")
                .telephone("677889900")
                .inscriptionPayee(false)
                .build();

        Membre membre = membreService.enregistrerMembre(request);

        // 1. Devrait être non éligible au début
        EligibilityResponse eligibilityStart = sortieService.verifierEligibiliteAide(membre.getId());
        assertFalse(eligibilityStart.isEligible());

        // Tenter de demander une aide -> doit être rejeté
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderAide(membre.getId(), "maladie");
        });

        // 2. Rendre le membre éligible (payer inscription et solidarité)
        membre.setInscriptionPayee(true);
        membre.setSolidaritePayee(true);
        membre.setDetteInscription(BigDecimal.ZERO);
        membre.setDetteSolidarite(BigDecimal.ZERO);
        membreRepository.save(membre);

        EligibilityResponse eligibilityEligible = sortieService.verifierEligibiliteAide(membre.getId());
        assertTrue(eligibilityEligible.isEligible());

        // 3. Tenter de demander avec caisse vide -> doit être rejeté car pas assez de
        // liquidités
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderAide(membre.getId(), "maladie");
        });

        // 4. Augmenter les fonds de la caisse solidarité
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        params.setCaisseSolidarites(new BigDecimal("1000000.00"));
        parametresGenerauxRepository.save(params);

        // 5. Demander l'aide maladie (100 000 FCFA)
        Sortie sortie = sortieService.demanderAide(membre.getId(), "maladie");
        assertNotNull(sortie.getId());
        assertEquals(new BigDecimal("100000.00"), sortie.getMontant());
        assertEquals(StatutSortie.en_attente_secretaire_general, sortie.getStatut());

        // 6. Validation SG
        Sortie sortieSg = sortieService.accepterSg(sortie.getId());
        assertEquals(StatutSortie.en_attente_tresorier, sortieSg.getStatut());

        // 7. Validation Tresorier
        Sortie sortieTr = sortieService.accepterTr(sortieSg.getId());
        assertEquals(StatutSortie.accepte_par_sg_accepte_par_tr, sortieTr.getStatut());

        // 8. Confirmation par le membre et retrait de la caisse
        Sortie sortieFin = sortieService.confirmerMembre(sortieTr.getId());
        assertEquals(StatutSortie.recue_par_membre, sortieFin.getStatut());

        // Vérifier que la caisse de solidarité a diminué
        ParametresGeneraux paramsFin = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, paramsFin.getCaisseSolidarites().compareTo(new BigDecimal("900000.00")));
    }

    @Test
    void testDemandeEtValidationPret() {
        // Créer les membres de test
        CreateMembreRequest req1 = CreateMembreRequest.builder()
                .nom("KENFACK")
                .prenom("Aline")
                .couriel("aline.kenfack@univ-yaounde1.cm")
                .telephone("655443322")
                .inscriptionPayee(false)
                .build();
        Membre membreAline = membreService.enregistrerMembre(req1);

        CreateMembreRequest req2 = CreateMembreRequest.builder()
                .nom("CHANA")
                .prenom("Anne")
                .couriel("anne.chana@univ-yaounde1.cm")
                .telephone("677889900")
                .inscriptionPayee(true)
                .build();
        Membre membreAnne = membreService.enregistrerMembre(req2);
        membreAnne.setEpargne(new BigDecimal("20000.00"));
        membreRepository.save(membreAnne);

        CreateMembreRequest req3 = CreateMembreRequest.builder()
                .nom("TCHOFFO")
                .prenom("Paul")
                .couriel("paul.tchoffo@univ-yaounde1.cm")
                .telephone("688990011")
                .inscriptionPayee(true)
                .build();
        Membre membrePaul = membreService.enregistrerMembre(req3);
        membrePaul.setEpargne(new BigDecimal("10000.00"));
        membreRepository.save(membrePaul);

        // 1. Devrait être non éligible au prêt au début (dettes non nulles, inscription
        // non payée)
        EligibilityResponse eligibilityStart = sortieService.verifierEligibilitePret(membreAline.getId());
        assertFalse(eligibilityStart.isEligible());

        // Tenter de demander un prêt -> doit être rejeté
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderPret(membreAline.getId(), new BigDecimal("10000.00"));
        });

        // 2. Rendre le membre éligible (payer inscription, solidarité et dettes à zéro)
        membreAline.setInscriptionPayee(true);
        membreAline.setSolidaritePayee(true);
        membreAline.setDetteInscription(BigDecimal.ZERO);
        membreAline.setDetteSolidarite(BigDecimal.ZERO);
        membreAline.setEpargne(new BigDecimal("10000.00")); // Epargne actuelle = 10 000 FCFA
        membreRepository.save(membreAline);

        EligibilityResponse eligibilityEligible = sortieService.verifierEligibilitePret(membreAline.getId());
        assertTrue(eligibilityEligible.isEligible());

        // 3. Tenter de demander 60 000 FCFA -> doit être rejeté car max = 5 * epargne =
        // 50 000 FCFA
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderPret(membreAline.getId(), new BigDecimal("60000.00"));
        });

        // 4. Tenter de demander 40 000 FCFA avec caisse d'épargne vide -> doit être
        // rejeté
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderPret(membreAline.getId(), new BigDecimal("40000.00"));
        });

        // 5. Approvisionner la caisse d'épargnes
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        params.setCaisseEpargnes(new BigDecimal("100000.00"));
        params.setTauxInteretEmprunts(new BigDecimal("0.03")); // 3% d'intérêt
        params.setDureeMaximaleEmprunt(3); // 3 mois
        parametresGenerauxRepository.save(params);

        // 6. Demander 40 000 FCFA (valide: < 50 000 et caisse = 100 000)
        Sortie sortie = sortieService.demanderPret(membreAline.getId(), new BigDecimal("40000.00"));
        assertNotNull(sortie.getId());
        assertEquals(new BigDecimal("40000.00"), sortie.getMontant());
        assertEquals(StatutSortie.en_attente_secretaire_general, sortie.getStatut());
        assertEquals("pret", sortie.getRaison());

        // 7. Validation SG
        Sortie sortieSg = sortieService.accepterSg(sortie.getId());
        assertEquals(StatutSortie.en_attente_tresorier, sortieSg.getStatut());

        // 8. Validation Tresorier : finalise l'emprunt (plus de confirmation membre)
        Sortie sortieTr = sortieService.accepterTr(sortieSg.getId());
        assertEquals(StatutSortie.accepte_par_sg_accepte_par_tr, sortieTr.getStatut());

        // Confirmation membre refusée pour un emprunt
        assertThrows(IllegalStateException.class, () -> {
            sortieService.confirmerMembre(sortieTr.getId());
        });

        // Intérêts calculés : 40 000 * 0.03 = 1 200 FCFA
        // Montant déduit de la caisse : 40 000 - 1 200 = 38 800 FCFA
        // Solde attendu dans la caisse des épargnes : 100 000 - 38 800 = 61 200 FCFA
        ParametresGeneraux paramsFin = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, paramsFin.getCaisseEpargnes().compareTo(new BigDecimal("61200.00")));

        // Vérifier l'insertion de l'emprunt dans la table prets
        List<Pret> prets = pretRepository.findByMembreIdAndStatut(membreAline.getId(), "non rembourse");
        assertEquals(1, prets.size());
        Pret pretEnregistre = prets.get(0);
        assertEquals(0, pretEnregistre.getMontant().compareTo(new BigDecimal("40000.00")));
        assertEquals(0, pretEnregistre.getMontantARembourser().compareTo(new BigDecimal("40000.00")));
        assertEquals("non rembourse", pretEnregistre.getStatut());
        assertNotNull(pretEnregistre.getDateEcheance());

        // Vérifier la répartition des intérêts :
        // Epargne Anne = 20000, Epargne Paul = 10000. Total = 30000.
        // Part Anne = 20000/30000 = 2/3. Part Paul = 10000/30000 = 1/3.
        // Intérêts accumulés Anne = 1200 * (2/3) = 800 FCFA
        // Intérêts accumulés Paul = 1200 * (1/3) = 400 FCFA
        Membre anneApres = membreRepository.findById(membreAnne.getId()).orElseThrow();
        Membre paulApres = membreRepository.findById(membrePaul.getId()).orElseThrow();
        Membre alineApres = membreRepository.findById(membreAline.getId()).orElseThrow();

        assertEquals(0, anneApres.getInteret().compareTo(new BigDecimal("800.00")));
        assertEquals(0, paulApres.getInteret().compareTo(new BigDecimal("400.00")));
        assertEquals(0, alineApres.getInteret().compareTo(BigDecimal.ZERO)); // L'emprunteur n'obtient rien

        // 10. Tester qu'Aline ne peut plus demander un prêt car elle a un prêt non
        // remboursé
        EligibilityResponse eligibilityApres = sortieService.verifierEligibilitePret(membreAline.getId());
        assertFalse(eligibilityApres.isEligible());
        assertTrue(eligibilityApres.getMessage().contains("Le membre a un emprunt non remboursé"));
    }

    @Test
    void testDemandeEtConfirmationRetrait() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("TCHOFFO")
                .prenom("Paul")
                .couriel("paul.tchoffo@univ-yaounde1.cm")
                .telephone("688990011")
                .inscriptionPayee(true)
                .build();
        Membre membre = membreService.enregistrerMembre(request);
        membre.setEpargne(new BigDecimal("20000.00"));
        membre.setInteret(new BigDecimal("5000.00"));
        membreRepository.save(membre);

        // 1. Vérifier solde total
        SoldeTotalResponse soldeStart = sortieService.obtenirSoldeTotal(membre.getId());
        assertEquals(0, soldeStart.getEpargne().compareTo(new BigDecimal("20000.00")));
        assertEquals(0, soldeStart.getInteret().compareTo(new BigDecimal("5000.00")));
        assertEquals(0, soldeStart.getSoldeTotal().compareTo(new BigDecimal("25000.00")));

        // 2. Essayer de retirer 30 000 FCFA -> doit échouer (dépasse épargne de 20 000)
        assertThrows(IllegalStateException.class, () -> {
            sortieService.demanderRetrait(membre.getId(), new BigDecimal("30000.00"));
        });

        // 3. Demander un retrait valide de 10 000 FCFA
        Sortie sortie = sortieService.demanderRetrait(membre.getId(), new BigDecimal("10000.00"));
        assertNotNull(sortie.getId());
        assertEquals(new BigDecimal("10000.00"), sortie.getMontant());
        assertEquals("retrait", sortie.getRaison());
        assertEquals(StatutSortie.en_attente_secretaire_general, sortie.getStatut());

        // 4. Approbation SG
        Sortie sortieSg = sortieService.accepterSg(sortie.getId());
        assertEquals(StatutSortie.en_attente_tresorier, sortieSg.getStatut());

        // 5. Approbation Trésorier
        Sortie sortieTr = sortieService.accepterTr(sortieSg.getId());
        assertEquals(StatutSortie.accepte_par_sg_accepte_par_tr, sortieTr.getStatut());

        // Initialiser la caisse d'épargne globale
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        params.setCaisseEpargnes(new BigDecimal("100000.00"));
        parametresGenerauxRepository.save(params);

        // 6. Confirmation par le membre
        Sortie sortieFin = sortieService.confirmerMembre(sortieTr.getId());
        assertEquals(StatutSortie.recue_par_membre, sortieFin.getStatut());

        // 7. Vérifications
        // - Caisse globale doit diminuer de 10 000 (100 000 -> 90 000)
        ParametresGeneraux paramsFin = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        assertEquals(0, paramsFin.getCaisseEpargnes().compareTo(new BigDecimal("90000.00")));

        // - Le membre :
        // * nouveau epargne = 20 000 - 10 000 = 10 000
        // * part retirée = 10 000 / 20 000 = 0.5 (50%)
        // * nouveau intérêt = 5 000 - (50% de 5 000) = 2 500
        Membre membreFin = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreFin.getEpargne().compareTo(new BigDecimal("10000.00")));
        assertEquals(0, membreFin.getInteret().compareTo(new BigDecimal("2500.00")));

        // Vérifier solde total final
        SoldeTotalResponse soldeFin = sortieService.obtenirSoldeTotal(membre.getId());
        assertEquals(0, soldeFin.getSoldeTotal().compareTo(new BigDecimal("12500.00")));
    }

    @Test
    void testRemboursementPret() {
        CreateMembreRequest request = CreateMembreRequest.builder()
                .nom("KENGNE")
                .prenom("Gaston")
                .couriel("gaston.kengne@univ-yaounde1.cm")
                .telephone("699001122")
                .inscriptionPayee(true)
                .build();
        Membre membre = membreService.enregistrerMembre(request);

        // Payer la solidarité pour être éligible à l'emprunt
        membre.setSolidaritePayee(true);
        membre.setDetteSolidarite(BigDecimal.ZERO);
        membre.setDetteInscription(BigDecimal.ZERO);
        membre.setEpargne(new BigDecimal("20000.00"));
        membreRepository.save(membre);

        // Initialiser la caisse d'épargne globale
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        params.setCaisseEpargnes(new BigDecimal("100000.00"));
        parametresGenerauxRepository.save(params);

        // Demander un prêt
        Sortie sortie = sortieService.demanderPret(membre.getId(), new BigDecimal("10000.00"));
        sortieService.accepterSg(sortie.getId());
        Sortie sortieTr = sortieService.accepterTr(sortie.getId());
        assertEquals(StatutSortie.accepte_par_sg_accepte_par_tr, sortieTr.getStatut());

        // La dette du membre doit être égale au capital prêté (10 000)
        Membre membreApresPret = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreApresPret.getDette().compareTo(new BigDecimal("10000.00")));

        // Le membre n'est plus éligible à un prêt car dette > 0
        EligibilityResponse eligibilityPret = sortieService.verifierEligibilitePret(membre.getId());
        assertFalse(eligibilityPret.isEligible());

        // Récupérer le prêt
        List<Pret> prets = pretRepository.findByMembreIdAndStatut(membre.getId(), "non rembourse");
        assertEquals(1, prets.size());
        Pret pret = prets.get(0);

        // Demander un remboursement partiel
        Remboursement remb1 = remboursementService.demanderRemboursement(pret.getId(), new BigDecimal("4000.00"));
        assertEquals("en_attente_tr", remb1.getStatut());

        // Valider le remboursement partiel
        Remboursement remb1Valide = remboursementService.validerRemboursement(remb1.getId());
        assertEquals("valide_tr", remb1Valide.getStatut());

        // Vérifier dette membre (10 000 - 4 000 = 6 000)
        Membre membreApresRemb1 = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreApresRemb1.getDette().compareTo(new BigDecimal("6000.00")));

        // Prêt toujours non remboursé
        Pret pretApresRemb1 = pretRepository.findById(pret.getId()).orElseThrow();
        assertEquals("non rembourse", pretApresRemb1.getStatut());
        assertNotNull(pretApresRemb1.getDateRemboursement());

        // Demander remboursement restant (6 000)
        Remboursement remb2 = remboursementService.demanderRemboursement(pret.getId(), new BigDecimal("6000.00"));
        remboursementService.validerRemboursement(remb2.getId());

        // Vérifier dette membre (6 000 - 6 000 = 0)
        Membre membreApresRemb2 = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreApresRemb2.getDette().compareTo(BigDecimal.ZERO));

        // Prêt marqué comme remboursé
        Pret pretApresRemb2 = pretRepository.findById(pret.getId()).orElseThrow();
        assertEquals("rembourse", pretApresRemb2.getStatut());
        assertNotNull(pretApresRemb2.getDateRemboursement());

        // Éligible à un nouveau prêt
        EligibilityResponse eligibilityPret2 = sortieService.verifierEligibilitePret(membre.getId());
        assertTrue(eligibilityPret2.isEligible());
    }

    @Test
    void testExerciceWorkflow() {
        // 1. Clôturer l'exercice par défaut
        exerciceService.cloturerExercice();
        assertTrue(exerciceRepository.findByStatut("en cours").isEmpty());

        // 2. Tenter de créer un membre et faire un versement (doit échouer car aucun
        // exercice n'est en cours)
        Membre membre = Membre.builder()
                .nom("Kengne")
                .prenom("Gaston")
                .couriel("gaston.test@univ-yaounde1.cm")
                .telephone("677111222")
                .motDePasse("MonMot2Passe!")
                .compteVerifie(true)
                .detteSolidarite(BigDecimal.ZERO)
                .detteInscription(BigDecimal.ZERO)
                .epargne(BigDecimal.ZERO)
                .etat("a jour")
                .build();
        membreRepository.save(membre);

        assertThrows(IllegalStateException.class, () -> {
            versementService.demanderEpargne(membre.getId(), new BigDecimal("5000.00"));
        });

        // 3. Ouvrir un nouvel exercice
        ExerciceCreationResponse openResp = exerciceService.ouvrirExercice(false);
        assertNotNull(openResp.getExercice());
        assertEquals("en cours", openResp.getExercice().getStatut());

        // Puisqu'on n'a qu'un seul membre et il était "a jour", les cmax sont divisés
        // par 1
        // cmaxSolidarite = 150000 * 1 = 150000 -> partSolidarite = 150000
        // cmaxInscription = 50000 * 1 = 50000 -> partInscription = 50000
        assertEquals(0, openResp.getPartSolidarite().compareTo(new BigDecimal("150000")));
        assertEquals(0, openResp.getPartInscription().compareTo(new BigDecimal("50000")));

        // Vérifier dette membre mise à jour et état passe à "non a jour"
        Membre membreApresOuverture = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, membreApresOuverture.getDetteSolidarite().compareTo(new BigDecimal("150000")));
        assertEquals(0, membreApresOuverture.getDetteInscription().compareTo(new BigDecimal("50000")));
        assertEquals("non a jour", membreApresOuverture.getEtat());

        // 4. Tenter d'ouvrir un autre exercice (doit échouer)
        assertThrows(IllegalStateException.class, () -> {
            exerciceService.ouvrirExercice(false);
        });

        // 5. Simuler un prêt en cours pour tester la clôture et l'ouverture forcée
        membreApresOuverture.setEpargne(new BigDecimal("10000.00"));
        membreApresOuverture.setDetteInscription(BigDecimal.ZERO);
        membreApresOuverture.setDetteSolidarite(BigDecimal.ZERO);
        membreApresOuverture.setInscriptionPayee(true);
        membreApresOuverture.setSolidaritePayee(true);
        membreApresOuverture.setEtat("a jour");
        membreRepository.save(membreApresOuverture);

        // Alimenter la caisse
        ParametresGeneraux params = parametresGenerauxRepository.findBySingletonGuard((byte) 1).orElseThrow();
        params.setCaisseEpargnes(new BigDecimal("100000.00"));
        parametresGenerauxRepository.save(params);

        // Emprunt (finalisé à la validation TR, sans confirmation membre)
        Sortie sortie = sortieService.demanderPret(membre.getId(), new BigDecimal("1000.00"));
        sortieService.accepterSg(sortie.getId());
        sortieService.accepterTr(sortie.getId());

        // Clôturer l'exercice doit échouer car un prêt est en cours
        assertThrows(IllegalStateException.class, () -> {
            exerciceService.cloturerExercice();
        });

        // 6. Rembourser le prêt pour pouvoir clôturer l'exercice
        List<Pret> prets = pretRepository.findByMembreIdAndStatut(membre.getId(), "non rembourse");
        assertEquals(1, prets.size());
        Pret pret = prets.get(0);

        Remboursement remb = remboursementService.demanderRemboursement(pret.getId(), pret.getMontantARembourser());
        remboursementService.validerRemboursement(remb.getId());

        // Clôturer l'exercice doit maintenant réussir
        Exercice closed = exerciceService.cloturerExercice();
        assertEquals("ferme", closed.getStatut());
        assertNotNull(closed.getDateFermeture());

        // 7. Simuler une dette et tester l'ouverture normale vs forcée
        // On recrée un prêt non remboursé directement dans le repository
        Pret pret2 = Pret.builder()
                .id(UUID.randomUUID().toString())
                .montant(new BigDecimal("1000.00"))
                .montantARembourser(new BigDecimal("1030.00"))
                .datePret(LocalDateTime.now())
                .dateEcheance(LocalDateTime.now().plusMonths(3))
                .membre(membre)
                .raison("pret")
                .statut("non rembourse")
                .build();
        pretRepository.save(pret2);

        // Ouvrir normalement doit échouer car prêt en cours
        assertThrows(IllegalStateException.class, () -> {
            exerciceService.ouvrirExercice(false);
        });

        // Ouvrir avec force doit réussir
        ExerciceCreationResponse forceOpenResp = exerciceService.ouvrirExercice(true);
        assertNotNull(forceOpenResp.getExercice());
        assertEquals("en cours", forceOpenResp.getExercice().getStatut());
    }

    @Test
    public void testPenaliteEtNotification() {
        // 1. Initialiser un membre avec de l'épargne et de la dette
        Membre membre = Membre.builder()
                .nom("TestPenalite")
                .prenom("Jean")
                .couriel("jean.penalite@test.com")
                .motDePasse(passwordService.encode("password123"))
                .telephone("+237677111223")
                .compteVerifie(true)
                .inscriptionPayee(true)
                .solidaritePayee(true)
                .detteSolidarite(BigDecimal.ZERO)
                .detteInscription(BigDecimal.ZERO)
                .epargne(new BigDecimal("50000.00")) // 50 000 d'épargne
                .dette(new BigDecimal("10000.00")) // 10 000 de dette restante
                .etat("a jour")
                .build();
        membre = membreRepository.save(membre);

        // Mettre à jour la caisse d'épargnes générale pour refléter l'épargne du membre
        ParametresGeneraux params = parametresGenerauxRepository.findAll().get(0);
        params.setCaisseEpargnes(new BigDecimal("100000.00"));
        parametresGenerauxRepository.save(params);

        // 2. Créer un prêt en retard (date d'échéance hier)
        Pret pretEnRetard = Pret.builder()
                .id(UUID.randomUUID().toString())
                .montant(new BigDecimal("10000.00"))
                .montantARembourser(new BigDecimal("10300.00"))
                .datePret(LocalDateTime.now().minusMonths(4))
                .dateEcheance(LocalDateTime.now().minusDays(1)) // hier
                .membre(membre)
                .raison("pret")
                .statut("non rembourse")
                .build();
        pretEnRetard = pretRepository.save(pretEnRetard);

        // 3. Créer un prêt futur (non éligible à la pénalité)
        Pret pretFutur = Pret.builder()
                .id(UUID.randomUUID().toString())
                .montant(new BigDecimal("10000.00"))
                .montantARembourser(new BigDecimal("10300.00"))
                .datePret(LocalDateTime.now())
                .dateEcheance(LocalDateTime.now().plusMonths(3)) // dans 3 mois
                .membre(membre)
                .raison("pret")
                .statut("non rembourse")
                .build();
        pretFutur = pretRepository.save(pretFutur);

        // 4. Tester la notification / vérification d'échéances
        remboursementService.verifierEcheancesEtNotifier();

        // 5. Tester l'application de pénalité sur le prêt futur (doit échouer)
        final String pretFuturId = pretFutur.getId();
        assertThrows(IllegalStateException.class, () -> {
            remboursementService.appliquerPenalite(pretFuturId);
        });

        // 6. Tester l'application de la pénalité sur le prêt en retard (doit réussir)
        remboursementService.appliquerPenalite(pretEnRetard.getId());

        // Vérifications
        // Pénalité fixe = 15 000
        // Intérêts = 10 000 * 0.03 = 300
        // Total pénalité = 15 300
        // Épargne attendue = 50 000 - 15 300 = 34 700
        Membre updatedMembre = membreRepository.findById(membre.getId()).orElseThrow();
        assertEquals(0, new BigDecimal("34700.00").compareTo(updatedMembre.getEpargne()));

        // Caisse épargnes attendue = 100 000 - 15 300 = 84 700
        ParametresGeneraux updatedParams = parametresGenerauxRepository.findById(params.getId()).orElseThrow();
        assertEquals(0, new BigDecimal("84700.00").compareTo(updatedParams.getCaisseEpargnes()));

        // 7. Tester l'application de la pénalité avec solde insuffisant (doit échouer)
        updatedMembre.setEpargne(new BigDecimal("5000.00"));
        membreRepository.save(updatedMembre);

        final String pretEnRetardId = pretEnRetard.getId();
        assertThrows(IllegalStateException.class, () -> {
            remboursementService.appliquerPenalite(pretEnRetardId);
        });
    }
}
