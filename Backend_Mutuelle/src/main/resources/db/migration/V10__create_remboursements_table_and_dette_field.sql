-- Flyway Migration V10: Add member loan debt field and create remboursements table
-- Database: MySQL

-- 1. Add dette column to membres with constraint
ALTER TABLE membres
ADD COLUMN dette DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
ADD CONSTRAINT chk_membres_dette CHECK (dette >= 0.00);

-- 2. Create remboursements table
CREATE TABLE remboursements (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    date_remboursement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pret_id VARCHAR(36) NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente_tr',
    PRIMARY KEY (id),
    CONSTRAINT chk_remboursements_montant CHECK (montant > 0.00),
    CONSTRAINT chk_remboursements_statut CHECK (statut IN ('en_attente_tr', 'valide_tr')),
    CONSTRAINT fk_remboursements_pret FOREIGN KEY (pret_id) REFERENCES prets(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
