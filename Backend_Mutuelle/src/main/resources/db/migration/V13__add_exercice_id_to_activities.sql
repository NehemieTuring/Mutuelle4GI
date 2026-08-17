-- Flyway Migration V13: Link activities to exercices
-- Database: MySQL

ALTER TABLE versements
    ADD COLUMN exercice_id VARCHAR(36) NULL AFTER membre_id;

ALTER TABLE sorties
    ADD COLUMN exercice_id VARCHAR(36) NULL AFTER membre_id;

ALTER TABLE prets
    ADD COLUMN exercice_id VARCHAR(36) NULL AFTER membre_id;

ALTER TABLE remboursements
    ADD COLUMN exercice_id VARCHAR(36) NULL AFTER pret_id;

SET @exercice_en_cours = (SELECT id FROM exercices WHERE statut = 'en cours' LIMIT 1);

UPDATE versements
SET exercice_id = @exercice_en_cours
WHERE exercice_id IS NULL AND @exercice_en_cours IS NOT NULL;

UPDATE sorties
SET exercice_id = @exercice_en_cours
WHERE exercice_id IS NULL AND @exercice_en_cours IS NOT NULL;

UPDATE prets
SET exercice_id = @exercice_en_cours
WHERE exercice_id IS NULL AND @exercice_en_cours IS NOT NULL;

UPDATE remboursements
SET exercice_id = @exercice_en_cours
WHERE exercice_id IS NULL AND @exercice_en_cours IS NOT NULL;

ALTER TABLE versements
    ADD CONSTRAINT fk_versements_exercice
        FOREIGN KEY (exercice_id) REFERENCES exercices (id);

ALTER TABLE sorties
    ADD CONSTRAINT fk_sorties_exercice
        FOREIGN KEY (exercice_id) REFERENCES exercices (id);

ALTER TABLE prets
    ADD CONSTRAINT fk_prets_exercice
        FOREIGN KEY (exercice_id) REFERENCES exercices (id);

ALTER TABLE remboursements
    ADD CONSTRAINT fk_remboursements_exercice
        FOREIGN KEY (exercice_id) REFERENCES exercices (id);
