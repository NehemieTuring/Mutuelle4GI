-- Ajout de Kameni Jaurès (absent de members.json lors de V16/V17)
-- Mot de passe : MonMot2Passe!
-- Dette solidarité/renflouement : max(0, 0) + 55000 (Reste 2026)
-- Épargne : 51369 (Total 2026)

INSERT INTO membres (
    id, nom, prenom, couriel, telephone, mot_de_passe,
    compte_verifie, inscription_payee, solidarite_payee,
    dette_inscription, dette_solidarite, epargne, interet, dette, etat
) VALUES (
    UUID(),
    'Kameni',
    'Jaurès',
    'kameni.jaures@mutuelle.com',
    '610000060',
    '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa',
    0, 1, 0,
    0.00, 55000.00, 51369.00, 0.00, 0.00, 'non a jour'
)
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    prenom = VALUES(prenom),
    mot_de_passe = VALUES(mot_de_passe),
    inscription_payee = 1,
    dette_inscription = 0.00,
    dette_solidarite = 55000.00,
    solidarite_payee = 0,
    epargne = 51369.00,
    etat = 'non a jour';

UPDATE parametres_generaux
SET caisse_epargnes = (
    SELECT IFNULL(SUM(epargne), 0.00) FROM membres
);
