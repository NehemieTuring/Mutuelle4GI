-- Flyway Migration V8: Create tables for help parameters and cash outflows (sorties)
-- Database: MySQL

-- 1. Table: parametres_aides
CREATE TABLE parametres_aides (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    type_aide VARCHAR(100) NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parametres_aides_type (type_aide),
    CONSTRAINT chk_parametres_aides_montant CHECK (montant > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default help options
INSERT INTO parametres_aides (id, type_aide, montant) VALUES
(UUID(), 'deces', 500000.00),
(UUID(), 'maladie', 100000.00),
(UUID(), 'mariage', 50000.00);

-- 2. Table: sorties
CREATE TABLE sorties (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    montant DECIMAL(15, 2) NOT NULL,
    date_sortie DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    membre_id VARCHAR(36) NOT NULL,
    raison VARCHAR(255) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente_secretaire_general',
    PRIMARY KEY (id),
    CONSTRAINT chk_sorties_montant CHECK (montant > 0.00),
    CONSTRAINT chk_sorties_statut CHECK (statut IN (
        'en_attente_secretaire_general',
        'en_attente_tresorier',
        'accepte_par_sg_refuse_par_tr',
        'accepte_par_sg_accepte_par_tr',
        'refuse_par_sg_accepte_par_tr',
        'refuse_par_sg_refuse_par_tr',
        'recue_par_membre'
    )),
    CONSTRAINT fk_sorties_membre FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
