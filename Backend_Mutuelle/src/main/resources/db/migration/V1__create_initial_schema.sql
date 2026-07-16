-- Flyway Migration V1: Create Initial Schema
-- Database: MySQL

-- 1. Table: membres
CREATE TABLE membres (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) DEFAULT NULL,
    couriel VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    photo VARCHAR(512) DEFAULT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_connexion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_membres_couriel (couriel),
    -- Validation du format de l'email
    CONSTRAINT chk_membres_couriel CHECK (couriel REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    -- Validation du format de l'image (jpeg, jpg ou png)
    CONSTRAINT chk_membres_photo CHECK (photo IS NULL OR photo REGEXP '\\.(jpe?g|png)$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: postes
CREATE TABLE postes (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    intitule VARCHAR(50) NOT NULL,
    description TEXT DEFAULT NULL,
    login VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_connexion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    membre_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_postes_intitule (intitule),
    UNIQUE KEY uq_postes_login (login),
    -- Validation du format de l'email du poste
    CONSTRAINT chk_postes_login CHECK (login REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    -- Validation des intitulés de postes autorisés
    CONSTRAINT chk_postes_intitule CHECK (intitule IN ('SECRETAIRE_GENERAL', 'TRESORIER', 'PRESIDENT', 'COMMISSAIRE_AUX_COMPTES')),
    -- Clé étrangère vers la table membres
    CONSTRAINT fk_postes_membre FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: parametres_generaux
CREATE TABLE parametres_generaux (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    montant_inscription DECIMAL(15, 2) NOT NULL DEFAULT 50000.00,
    montant_solidarite DECIMAL(15, 2) NOT NULL DEFAULT 150000.00,
    taux_interet_emprunts DECIMAL(5, 4) NOT NULL DEFAULT 0.0300,
    montant_penalite_retard DECIMAL(15, 2) NOT NULL DEFAULT 15000.00,
    facteur_emprunt INT NOT NULL DEFAULT 5,
    -- Colonne technique pour garantir l'existence d'une unique ligne dans cette table
    singleton_guard TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parametres_singleton (singleton_guard),
    CONSTRAINT chk_parametres_singleton CHECK (singleton_guard = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de la configuration par défaut (la seule ligne autorisée dans parametres_generaux)
INSERT INTO parametres_generaux (id, montant_inscription, montant_solidarite, taux_interet_emprunts, montant_penalite_retard, facteur_emprunt)
VALUES (UUID(), 50000.00, 150000.00, 0.0300, 15000.00, 5);
