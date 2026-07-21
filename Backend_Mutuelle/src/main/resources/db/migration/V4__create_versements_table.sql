-- Flyway Migration V4: Create versements table and update parametres_generaux
-- Database: MySQL

-- 1. Add caisse_inscriptions column to parametres_generaux table
ALTER TABLE parametres_generaux
ADD COLUMN caisse_inscriptions DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- 2. Create table versements
CREATE TABLE versements (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    montant DECIMAL(15, 2) NOT NULL,
    date_versement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    membre_id VARCHAR(36) NOT NULL,
    raison VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL,
    description VARCHAR(512) DEFAULT NULL,
    PRIMARY KEY (id),
    -- Clé étrangère vers la table membres
    CONSTRAINT fk_versements_membre FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Contraintes CHECK pour valider les valeurs autorisées
    CONSTRAINT chk_versements_montant CHECK (montant > 0.00),
    CONSTRAINT chk_versements_raison CHECK (raison IN ('inscription', 'epargne', 'solidarite', 'remboursement')),
    CONSTRAINT chk_versements_statut CHECK (statut IN ('en_attente', 'accepte', 'refuse'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
