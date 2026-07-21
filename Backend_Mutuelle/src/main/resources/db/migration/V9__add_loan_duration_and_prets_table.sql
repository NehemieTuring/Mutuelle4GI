-- Flyway Migration V9: Add loan duration parameter, member interest accumulation, and prets table
-- Database: MySQL

-- 1. Add duree_maximale_emprunt to parametres_generaux
ALTER TABLE parametres_generaux
ADD COLUMN duree_maximale_emprunt INT NOT NULL DEFAULT 3;

-- 2. Add interet column to membres with constraint
ALTER TABLE membres
ADD COLUMN interet DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
ADD CONSTRAINT chk_membres_interet CHECK (interet >= 0.00);

-- 3. Create prets table
CREATE TABLE prets (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    montant DECIMAL(15, 2) NOT NULL,
    date_pret DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    membre_id VARCHAR(36) NOT NULL,
    raison VARCHAR(255) NOT NULL,
    montant_a_rembourser DECIMAL(15, 2) NOT NULL,
    date_echeance DATETIME NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'non rembourse',
    PRIMARY KEY (id),
    CONSTRAINT chk_prets_montant CHECK (montant > 0.00),
    CONSTRAINT chk_prets_montant_a_rembourser CHECK (montant_a_rembourser > 0.00),
    CONSTRAINT chk_prets_statut CHECK (statut IN ('rembourse', 'non rembourse')),
    CONSTRAINT fk_prets_membre FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
