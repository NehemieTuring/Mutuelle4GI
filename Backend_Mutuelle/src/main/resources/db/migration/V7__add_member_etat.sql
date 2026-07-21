-- Flyway Migration V7: Add member status 'etat'
-- Database: MySQL

-- 1. Add etat column with check constraint
ALTER TABLE membres
ADD COLUMN etat VARCHAR(50) NOT NULL DEFAULT 'non a jour',
ADD CONSTRAINT chk_membres_etat CHECK (etat IN ('Inactif', 'non a jour', 'a jour'));

-- 2. Update existing members' states based on their dette_solidarite
UPDATE membres SET etat = 'Inactif' WHERE dette_solidarite >= 250000.00;
UPDATE membres SET etat = 'non a jour' WHERE dette_solidarite < 250000.00 AND dette_solidarite > 0.00;
UPDATE membres SET etat = 'a jour' WHERE dette_solidarite = 0.00;
