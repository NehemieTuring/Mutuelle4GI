-- Flyway Migration V6: Add savings (épargne) fields and check constraints
-- Database: MySQL

-- 1. Add epargne column to membres table with check constraint
ALTER TABLE membres
ADD COLUMN epargne DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
ADD CONSTRAINT chk_membres_epargne CHECK (epargne >= 0.00);

-- 2. Add caisse_epargnes column to parametres_generaux table with check constraint
ALTER TABLE parametres_generaux
ADD COLUMN caisse_epargnes DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
ADD CONSTRAINT chk_parametres_caisse_epargnes CHECK (caisse_epargnes >= 0.00);
