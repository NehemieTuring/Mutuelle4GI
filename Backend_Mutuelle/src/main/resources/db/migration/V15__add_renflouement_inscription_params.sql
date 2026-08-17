-- Formule de renflouement de la caisse d'inscription à l'ouverture d'exercice :
--   (mensualite × nb_mois) + complement + forfait
-- Défaut : (45 000 × 12) + 60 000 + 150 000 = 750 000 FCFA
-- Cette somme est ensuite répartie entre les membres actifs (etat <> 'Inactif').

ALTER TABLE parametres_generaux
    ADD COLUMN mensualite_renflouement DECIMAL(15, 2) NOT NULL DEFAULT 45000.00,
    ADD COLUMN nb_mois_renflouement INT NOT NULL DEFAULT 12,
    ADD COLUMN complement_renflouement DECIMAL(15, 2) NOT NULL DEFAULT 60000.00,
    ADD COLUMN forfait_renflouement DECIMAL(15, 2) NOT NULL DEFAULT 150000.00;
