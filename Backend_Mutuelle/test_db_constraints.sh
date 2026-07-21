#!/usr/bin/env bash

# ==============================================================================
# Script de Test des Contraintes de la Base de Données Mutuelle
# Ce script exécute des scénarios d'insertion, mise à jour, suppression et
# récupération sur les tables pour valider toutes les contraintes de schéma.
# ==============================================================================

# Charger les variables du fichier .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "[-] Fichier .env introuvable. Veuillez configurer le fichier .env d'abord."
    exit 1
fi

DB_CONTAINER="mutuelle-db"
DB_USER=${DB_USER:-mutuelle_user}
DB_PASSWORD=${DB_PASSWORD:-mutuelle_pass}
DB_NAME=${DB_NAME:-mutuelle_db}

# Fonction pour exécuter une requête SQL et retourner son code de sortie
run_sql() {
    local sql="$1"
    docker exec -i "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "$sql" 2>/dev/null
    return $?
}

# Compteurs de tests
TESTS_RUN=0
TESTS_PASSED=0

# Fonction pour évaluer le résultat du test
# $1: Nom du test
# $2: Code de retour attendu (0 pour succès, non-zéro pour échec)
# $3: Requête SQL à exécuter
evaluate_test() {
    local test_name="$1"
    local expected="$2"
    local sql="$3"
    
    ((TESTS_RUN++))
    
    run_sql "$sql"
    local exit_code=$?
    
    if [ "$expected" -eq 0 ]; then
        # On attend un SUCCÈS
        if [ $exit_code -eq 0 ]; then
            echo -e "[\e[32mPASS\e[0m] $test_name (Succès obtenu comme prévu)"
            ((TESTS_PASSED++))
        else
            echo -e "[\e[31mFAIL\e[0m] $test_name (Échec obtenu alors qu'un succès était attendu)"
        fi
    else
        # On attend un ÉCHEC
        if [ $exit_code -ne 0 ]; then
            echo -e "[\e[32mPASS\e[0m] $test_name (Échec obtenu comme prévu par la contrainte)"
            ((TESTS_PASSED++))
        else
            echo -e "[\e[31mFAIL\e[0m] $test_name (Succès obtenu alors qu'un échec était attendu)"
        fi
    fi
}

echo "======================================================================"
echo "DÉBUT DES TESTS DES CONTRAINTES DE LA BASE DE DONNÉES"
echo "======================================================================"

# Nettoyer les données de test précédentes
echo "[*] Nettoyage de la base de données..."
run_sql "DELETE FROM remboursements;"
run_sql "DELETE FROM prets;"
run_sql "DELETE FROM sorties;"
run_sql "DELETE FROM parametres_aides;"
run_sql "DELETE FROM versements;"
run_sql "DELETE FROM postes;"
run_sql "DELETE FROM membres;"
run_sql "DELETE FROM exercices;"
run_sql "DELETE FROM parametres_generaux WHERE singleton_guard != 1;"

# Générer des UUIDs constants pour les tests
MEMBER_ID_1="a1a1a1a1-1111-1111-1111-111111111111"
MEMBER_ID_2="b2b2b2b2-2222-2222-2222-222222222222"
POSTE_ID_1="c3c3c3c3-3333-3333-3333-333333333333"
POSTE_ID_2="d4d4d4d4-4444-4444-4444-444444444444"
VERSEMENT_ID_1="e5e5e5e5-5555-5555-5555-555555555555"
VERSEMENT_ID_2="f6f6f6f6-6666-6666-6666-666666666666"
VERSEMENT_ID_3="77777777-7777-7777-7777-777777777777"
AIDE_ID_1="88888888-8888-8888-8888-888888888888"
SORTIE_ID_1="99999999-9999-9999-9999-999999999999"
EXERCICE_ID_1="a1e1e1e1-1111-1111-1111-111111111111"
EXERCICE_ID_2="b2e2e2e2-2222-2222-2222-222222222222"
PRET_ID_1="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
REMB_ID_1="cccccccc-cccc-cccc-cccc-cccccccccccc"

# ------------------------------------------------------------------------------
# TESTS SUR LA TABLE `membres`
# ------------------------------------------------------------------------------
echo -e "\n--- [TABLE membres] ---"

# T1: Insertion membre valide
evaluate_test "Insertion membre valide" 0 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe) VALUES ('$MEMBER_ID_1', 'Dupont', 'Jean', 'jean.dupont@example.com', '+33612345678', 'password123');"

# T2: Insertion membre obligatoire manquant (nom NULL)
evaluate_test "Insertion invalide (nom obligatoire manquant)" 1 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe) VALUES (UUID(), NULL, 'Pierre', 'pierre@example.com', '+33612345679', 'password123');"

# T3: Insertion email invalide (format incorrect)
evaluate_test "Insertion invalide (format email incorrect)" 1 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe) VALUES (UUID(), 'Martin', 'Paul', 'email_invalide.com', '+33612345680', 'password123');"

# T4: Insertion doublon d'email
evaluate_test "Insertion invalide (doublon d'email)" 1 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe) VALUES (UUID(), 'Dupond', 'Marc', 'jean.dupont@example.com', '+33698765432', 'password123');"

# T5: Insertion format photo invalide (.gif)
evaluate_test "Insertion invalide (extension photo non supportée)" 1 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, photo, mot_de_passe) VALUES (UUID(), 'Martin', 'Luc', 'luc.martin@example.com', '+33612345681', 'photo.gif', 'password123');"

# T6: Insertion format photo valide (.png)
evaluate_test "Insertion valide (extension photo supportée .png)" 0 \
"INSERT INTO membres (id, nom, prenom, couriel, telephone, photo, mot_de_passe) VALUES ('$MEMBER_ID_2', 'Martin', 'Luc', 'luc.martin@example.com', '+33612345681', 'profile.png', 'password123');"

# T7: Mise à jour avec email invalide
evaluate_test "Mise à jour invalide (email incorrect)" 1 \
"UPDATE membres SET couriel = 'bad_email' WHERE id = '$MEMBER_ID_1';"

# T8: Récupération de membre valide
evaluate_test "Récupération membre valide" 0 \
"SELECT * FROM membres WHERE id = '$MEMBER_ID_1';"


# ------------------------------------------------------------------------------
# TESTS SUR LA TABLE `postes`
# ------------------------------------------------------------------------------
echo -e "\n--- [TABLE postes] ---"

# T9: Insertion poste valide (PRESIDENT) lié à un membre existant
evaluate_test "Insertion poste valide (PRESIDENT)" 0 \
"INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id) VALUES ('$POSTE_ID_1', 'PRESIDENT', 'Président de la mutuelle', 'president@mutuelle.com', 'hashed_pass_123', '$MEMBER_ID_1');"

# T10: Insertion poste lié à un membre inexistant (Clé étrangère invalide)
evaluate_test "Insertion invalide (membre_id inexistant)" 1 \
"INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id) VALUES (UUID(), 'TRESORIER', 'Trésorier', 'tresorier@mutuelle.com', 'hashed_pass_123', '00000000-0000-0000-0000-000000000000');"

# T11: Insertion poste avec intitulé invalide
evaluate_test "Insertion invalide (intitulé non autorisé)" 1 \
"INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id) VALUES (UUID(), 'DIRECTEUR_GENERAL', 'Directeur', 'dir@mutuelle.com', 'hashed_pass_123', '$MEMBER_ID_1');"

# T12: Insertion poste doublon d'intitulé (PRESIDENT existe déjà)
evaluate_test "Insertion invalide (doublon d'intitulé PRESIDENT)" 1 \
"INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id) VALUES (UUID(), 'PRESIDENT', 'Autre président', 'pres2@mutuelle.com', 'hashed_pass_123', '$MEMBER_ID_2');"

# T13: Insertion poste doublon de login
evaluate_test "Insertion invalide (doublon de login)" 1 \
"INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id) VALUES (UUID(), 'TRESORIER', 'Trésorier', 'president@mutuelle.com', 'hashed_pass_123', '$MEMBER_ID_2');"

# T14: Suppression membre parent référencé (doit échouer - RESTRICT)
evaluate_test "Suppression membre référencé par un poste (RESTRICT)" 1 \
"DELETE FROM membres WHERE id = '$MEMBER_ID_1';"


# ------------------------------------------------------------------------------
# TESTS SUR LA TABLE `parametres_generaux`
# ------------------------------------------------------------------------------
echo -e "\n--- [TABLE parametres_generaux] ---"

# T15: Vérification de l'instance par défaut existante
evaluate_test "Vérification présence de la configuration initiale" 0 \
"SELECT * FROM parametres_generaux WHERE singleton_guard = 1;"

# T16: Tentative d'insertion d'une seconde ligne (doit échouer - UNIQUE/CHECK)
evaluate_test "Insertion invalide (tentative de doublon de configuration)" 1 \
"INSERT INTO parametres_generaux (id, montant_inscription, montant_solidarite, taux_interet_emprunts, montant_penalite_retard, facteur_emprunt) VALUES (UUID(), 60000.00, 160000.00, 0.0500, 10000.00, 4);"

# T17: Mise à jour valide des paramètres existants
evaluate_test "Mise à jour valide des paramètres" 0 \
"UPDATE parametres_generaux SET montant_inscription = 55000.00 WHERE singleton_guard = 1;"


# ------------------------------------------------------------------------------
# TESTS SUR LA TABLE `versements`
# ------------------------------------------------------------------------------
echo -e "\n--- [TABLE versements] ---"

# T18: Insertion versement valide (statut en_attente, raison inscription)
evaluate_test "Insertion versement valide (inscription en attente)" 0 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES ('$VERSEMENT_ID_1', 50000.00, '$MEMBER_ID_1', 'inscription', 'en_attente', 'Inscription du membre');"

# T19: Insertion versement invalide (montant <= 0)
evaluate_test "Insertion versement invalide (montant négatif)" 1 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES (UUID(), -100.00, '$MEMBER_ID_1', 'inscription', 'en_attente', 'Invalide');"

# T20: Insertion versement invalide (raison non supportée)
evaluate_test "Insertion versement invalide (raison incorrecte)" 1 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES (UUID(), 50000.00, '$MEMBER_ID_1', 'assurance', 'en_attente', 'Invalide');"

# T21: Insertion versement invalide (statut incorrect)
evaluate_test "Insertion versement invalide (statut incorrect)" 1 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES (UUID(), 50000.00, '$MEMBER_ID_1', 'inscription', 'inconnu', 'Invalide');"

# T22: Insertion versement lié à un membre inexistant (clé étrangère)
evaluate_test "Insertion versement invalide (membre inexistant)" 1 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES (UUID(), 50000.00, '00000000-0000-0000-0000-000000000000', 'inscription', 'en_attente', 'Invalide');"

# T23: Récupération de versement valide
evaluate_test "Récupération versement valide" 0 \
"SELECT * FROM versements WHERE id = '$VERSEMENT_ID_1';"

# T24: Mise à jour valide du statut
evaluate_test "Mise à jour versement valide (statut accepte)" 0 \
"UPDATE versements SET statut = 'accepte' WHERE id = '$VERSEMENT_ID_1';"

# T25: Mise à jour invalide du statut (statut erroné)
evaluate_test "Mise à jour versement invalide (statut erroné)" 1 \
"UPDATE versements SET statut = 'erreur' WHERE id = '$VERSEMENT_ID_1';"

# T26: Suppression membre référencé par un versement (RESTRICT)
evaluate_test "Suppression membre référencé par un versement (RESTRICT)" 1 \
"DELETE FROM membres WHERE id = '$MEMBER_ID_1';"

# T27: Suppression d'un versement valide
evaluate_test "Suppression d'un versement" 0 \
"DELETE FROM versements WHERE id = '$VERSEMENT_ID_1';"

# T28: Contrainte sur dette_inscription négative
evaluate_test "Mise à jour membre invalide (dette_inscription négative)" 1 \
"UPDATE membres SET dette_inscription = -10.00 WHERE id = '$MEMBER_ID_1';"

# T29: Contrainte sur dette_solidarite négative
evaluate_test "Mise à jour membre invalide (dette_solidarite négative)" 1 \
"UPDATE membres SET dette_solidarite = -20.00 WHERE id = '$MEMBER_ID_1';"

# T30: Contrainte sur caisse_solidarites négative
evaluate_test "Mise à jour paramètres invalides (caisse_solidarites négative)" 1 \
"UPDATE parametres_generaux SET caisse_solidarites = -5.00 WHERE singleton_guard = 1;"

# T31: Insertion versement solidarité valide
evaluate_test "Insertion versement solidarité valide" 0 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES ('$VERSEMENT_ID_2', 75000.00, '$MEMBER_ID_1', 'solidarite', 'en_attente', 'Cotisation solidarité');"

# T32: Contrainte sur epargne négative
evaluate_test "Mise à jour membre invalide (epargne négative)" 1 \
"UPDATE membres SET epargne = -5.00 WHERE id = '$MEMBER_ID_1';"

# T33: Contrainte sur caisse_epargnes négative
evaluate_test "Mise à jour paramètres invalides (caisse_epargnes négative)" 1 \
"UPDATE parametres_generaux SET caisse_epargnes = -10.00 WHERE singleton_guard = 1;"

# T34: Insertion versement epargne valide
evaluate_test "Insertion versement épargne valide" 0 \
"INSERT INTO versements (id, montant, membre_id, raison, statut, description) VALUES ('$VERSEMENT_ID_3', 30000.00, '$MEMBER_ID_1', 'epargne', 'en_attente', 'Cotisation épargne');"

# T35: Mise à jour etat valide
evaluate_test "Mise à jour etat valide (Inactif)" 0 \
"UPDATE membres SET etat = 'Inactif' WHERE id = '$MEMBER_ID_1';"

# T36: Mise à jour etat invalide
evaluate_test "Mise à jour etat invalide (incorrect_state)" 1 \
"UPDATE membres SET etat = 'incorrect_state' WHERE id = '$MEMBER_ID_1';"

# T37: Insertion parametres_aides valide
evaluate_test "Insertion type aide valide" 0 \
"INSERT INTO parametres_aides (id, type_aide, montant) VALUES ('$AIDE_ID_1', 'naissance', 15000.00);"

# T38: Insertion parametres_aides invalide (montant négatif)
evaluate_test "Insertion type aide invalide (montant négatif)" 1 \
"INSERT INTO parametres_aides (id, type_aide, montant) VALUES (UUID(), 'autre_aide', -50.00);"

# T39: Insertion sorties valide
evaluate_test "Insertion sortie valide" 0 \
"INSERT INTO sorties (id, montant, membre_id, raison, statut) VALUES ('$SORTIE_ID_1', 100000.00, '$MEMBER_ID_1', 'aide_maladie', 'en_attente_secretaire_general');"

# T40: Insertion sorties invalide (statut non autorisé)
evaluate_test "Insertion sortie invalide (statut incorrect)" 1 \
"INSERT INTO sorties (id, montant, membre_id, raison, statut) VALUES (UUID(), 100000.00, '$MEMBER_ID_1', 'aide_maladie', 'statut_incorrect');"

# T41: Insertion sorties invalide (montant négatif)
evaluate_test "Insertion sortie invalide (montant négatif)" 1 \
"INSERT INTO sorties (id, montant, membre_id, raison, statut) VALUES (UUID(), -100.00, '$MEMBER_ID_1', 'aide_maladie', 'en_attente_secretaire_general');"

# T42: Insertion sorties invalide (membre inexistant)
evaluate_test "Insertion sortie invalide (membre inexistant)" 1 \
"INSERT INTO sorties (id, montant, membre_id, raison, statut) VALUES (UUID(), 50000.00, 'non-existent-id', 'aide_maladie', 'en_attente_secretaire_general');"

# T43: Insertion pret valide
evaluate_test "Insertion pret valide" 0 \
"INSERT INTO prets (id, montant, membre_id, raison, montant_a_rembourser, date_echeance, statut) VALUES ('$PRET_ID_1', 100000.00, '$MEMBER_ID_1', 'Emprunt', 103000.00, DATE_ADD(NOW(), INTERVAL 3 MONTH), 'non rembourse');"

# T44: Insertion pret invalide (montant négatif)
evaluate_test "Insertion pret invalide (montant négatif)" 1 \
"INSERT INTO prets (id, montant, membre_id, raison, montant_a_rembourser, date_echeance, statut) VALUES (UUID(), -100.00, '$MEMBER_ID_1', 'Emprunt', 103000.00, DATE_ADD(NOW(), INTERVAL 3 MONTH), 'non rembourse');"

# T45: Insertion pret invalide (statut incorrect)
evaluate_test "Insertion pret invalide (statut incorrect)" 1 \
"INSERT INTO prets (id, montant, membre_id, raison, montant_a_rembourser, date_echeance, statut) VALUES (UUID(), 100000.00, '$MEMBER_ID_1', 'Emprunt', 103000.00, DATE_ADD(NOW(), INTERVAL 3 MONTH), 'statut_incorrect');"

# T46: Insertion membre invalide (interet négatif)
evaluate_test "Mise à jour membre invalide (interet négatif)" 1 \
"UPDATE membres SET interet = -50.00 WHERE id = '$MEMBER_ID_1';"

# T47: Insertion sortie retrait valide
evaluate_test "Insertion sortie retrait valide" 0 \
"INSERT INTO sorties (id, montant, membre_id, raison, statut) VALUES (UUID(), 10000.00, '$MEMBER_ID_1', 'retrait', 'en_attente_secretaire_general');"

# T48: Insertion remboursement valide
evaluate_test "Insertion remboursement valide" 0 \
"INSERT INTO remboursements (id, pret_id, montant, statut) VALUES ('$REMB_ID_1', '$PRET_ID_1', 5000.00, 'en_attente_tr');"

# T49: Insertion remboursement invalide (montant négatif)
evaluate_test "Insertion remboursement invalide (montant négatif)" 1 \
"INSERT INTO remboursements (id, pret_id, montant, statut) VALUES (UUID(), '$PRET_ID_1', -100.00, 'en_attente_tr');"

# T50: Insertion remboursement invalide (statut incorrect)
evaluate_test "Insertion remboursement invalide (statut incorrect)" 1 \
"INSERT INTO remboursements (id, pret_id, montant, statut) VALUES (UUID(), '$PRET_ID_1', 5000.00, 'statut_incorrect');"

# T51: Mise à jour membre invalide (dette d'emprunt négative)
evaluate_test "Mise à jour membre invalide (dette négative)" 1 \
"UPDATE membres SET dette = -50.00 WHERE id = '$MEMBER_ID_1';"

# T52: Insertion exercice valide
evaluate_test "Insertion exercice valide" 0 \
"INSERT INTO exercices (id, date_ouverture, statut) VALUES ('$EXERCICE_ID_1', NOW(), 'en cours');"

# T53: Insertion exercice avec statut invalide
evaluate_test "Insertion exercice avec statut invalide" 1 \
"INSERT INTO exercices (id, date_ouverture, statut) VALUES (UUID(), NOW(), 'statut_incorrect');"

# T54: Double insertion d'exercice en cours
evaluate_test "Double insertion d'exercice en cours" 1 \
"INSERT INTO exercices (id, date_ouverture, statut) VALUES ('$EXERCICE_ID_2', NOW(), 'en cours');"




# ------------------------------------------------------------------------------
# NETTOYAGE FINAL ET BILAN
# ------------------------------------------------------------------------------
echo -e "\n--- [NETTOYAGE] ---"
run_sql "DELETE FROM remboursements WHERE id = '$REMB_ID_1';"
run_sql "DELETE FROM prets WHERE id = '$PRET_ID_1';"
run_sql "DELETE FROM sorties WHERE id = '$SORTIE_ID_1';"
run_sql "DELETE FROM parametres_aides WHERE id = '$AIDE_ID_1';"
run_sql "DELETE FROM versements WHERE id IN ('$VERSEMENT_ID_1', '$VERSEMENT_ID_2', '$VERSEMENT_ID_3');"
run_sql "DELETE FROM postes WHERE id = '$POSTE_ID_1';"
run_sql "DELETE FROM membres WHERE id IN ('$MEMBER_ID_1', '$MEMBER_ID_2');"
run_sql "DELETE FROM exercices WHERE id IN ('$EXERCICE_ID_1', '$EXERCICE_ID_2');"

echo -e "\n======================================================================"
echo "BILAN DES TESTS : $TESTS_PASSED / $TESTS_RUN passés"
echo "======================================================================"

if [ "$TESTS_PASSED" -eq "$TESTS_RUN" ]; then
    echo -e "\e[32mTOUTES LES CONTRAINTES DE LA BD SONT FONCTIONNELLES !\e[0m"
    exit 0
else
    echo -e "\e[31mDES ANOMALIES ONT ÉTÉ DÉTECTÉES DANS LES CONTRAINTES.\e[0m"
    exit 1
fi
