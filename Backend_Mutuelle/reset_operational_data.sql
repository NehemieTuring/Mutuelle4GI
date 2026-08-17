-- Réinitialisation des données opérationnelles
-- Conserve : parametres_generaux (tarifs), postes (bureau), parametres_aides
-- Remet les membres existants à l'état initial (aucune action effectuée)
-- Dettes à 0 tant qu'aucun exercice n'est ouvert (attribuées à l'ouverture d'exercice)
-- Mot de passe membre : MonMot2Passe! (hash BCrypt)

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM remboursements;
DELETE FROM prets;
DELETE FROM sorties;
DELETE FROM versements;
DELETE FROM exercices;

UPDATE parametres_generaux
SET caisse_inscriptions = 0.00,
    caisse_solidarites = 0.00,
    caisse_epargnes = 0.00;

-- Hash BCrypt de « MonMot2Passe! » (régénérer si besoin)
SET @pwd := '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa';

UPDATE membres SET
  compte_verifie = 0,
  inscription_payee = 0,
  solidarite_payee = 0,
  dette_solidarite = 0.00,
  dette_inscription = 0.00,
  epargne = 0.00,
  interet = 0.00,
  dette = 0.00,
  etat = 'a jour',
  mot_de_passe = @pwd,
  photo = NULL;

SET FOREIGN_KEY_CHECKS = 1;
