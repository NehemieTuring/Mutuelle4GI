-- Flyway Migration V12: Create exercices table
-- Database: MySQL

CREATE TABLE exercices (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    date_ouverture DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_fermeture DATETIME DEFAULT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'en cours',
    exercice_en_cours VARCHAR(50) GENERATED ALWAYS AS (CASE WHEN statut = 'en cours' THEN 'UNIQUE' ELSE NULL END) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uq_exercice_en_cours (exercice_en_cours),
    CONSTRAINT chk_exercices_statut CHECK (statut IN ('en cours', 'ferme'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
