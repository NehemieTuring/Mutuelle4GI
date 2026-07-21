-- Flyway Migration V5: Add solidarity payment fields and debts with CHECK constraints
-- Database: MySQL

-- 1. Add columns to membres table
ALTER TABLE membres
ADD COLUMN solidarite_payee TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN dette_solidarite DECIMAL(15, 2) NOT NULL DEFAULT 150000.00,
ADD COLUMN dette_inscription DECIMAL(15, 2) NOT NULL DEFAULT 50000.00,
ADD CONSTRAINT chk_membres_dette_solidarite CHECK (dette_solidarite >= 0.00),
ADD CONSTRAINT chk_membres_dette_inscription CHECK (dette_inscription >= 0.00);

-- Adjust dette_inscription for existing members if they already paid
UPDATE membres SET dette_inscription = 0.00 WHERE inscription_payee = 1;

-- 2. Add caisse_solidarites column to parametres_generaux table
ALTER TABLE parametres_generaux
ADD COLUMN caisse_solidarites DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
ADD CONSTRAINT chk_parametres_caisse_solidarites CHECK (caisse_solidarites >= 0.00);
