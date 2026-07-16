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
run_sql "DELETE FROM postes;"
run_sql "DELETE FROM membres;"
run_sql "DELETE FROM parametres_generaux WHERE singleton_guard != 1;"

# Générer des UUIDs constants pour les tests
MEMBER_ID_1="a1a1a1a1-1111-1111-1111-111111111111"
MEMBER_ID_2="b2b2b2b2-2222-2222-2222-222222222222"
POSTE_ID_1="c3c3c3c3-3333-3333-3333-333333333333"
POSTE_ID_2="d4d4d4d4-4444-4444-4444-444444444444"

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
# NETTOYAGE FINAL ET BILAN
# ------------------------------------------------------------------------------
echo -e "\n--- [NETTOYAGE] ---"
run_sql "DELETE FROM postes WHERE id = '$POSTE_ID_1';"
run_sql "DELETE FROM membres WHERE id IN ('$MEMBER_ID_1', '$MEMBER_ID_2');"

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
