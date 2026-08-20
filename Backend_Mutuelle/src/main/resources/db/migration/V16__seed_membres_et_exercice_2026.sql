-- Flyway V16 : membres + exercice 2026 + dette unique solidarité/renflouement (Excel)
-- Mot de passe commun : MonMot2Passe!
--
-- Dette unique (solidarité = renflouement) :
--   max(0, Dette Totale fin 2025) + Reste inscription/renflouement 2026
--   (plancher final à 0)
-- Stockée dans dette_solidarite. Inscription forcée payée (dette_inscription = 0).
-- Aucun renflouement automatique à l'ouverture d'exercice.

INSERT INTO membres (
    id, nom, prenom, couriel, telephone, mot_de_passe,
    compte_verifie, inscription_payee, solidarite_payee,
    dette_inscription, dette_solidarite, epargne, interet, dette, etat
) VALUES
(UUID(), 'Atock', 'Stephane', 'stephane.atock@mutuelle.com', '610000001', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Awono O.', 'Charles', 'charles.awono@mutuelle.com', '610000002', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Batchakui', 'Bernabé', 'bernabe.batchakui@univ-yaounde1.cm', '677602012', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Belobo Belobo', 'Didier', 'didier.belobo@mutuelle.com', '610000003', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Bidoung', 'Jean Calvin', 'bidoung@yahoo.com', '696488503', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Bitang A Ziem', 'Daniel', 'daniel.bitangaziem@mutuelle.com', '610000004', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Biyeme', 'Florent', 'florent.biyeme@mutuelle.com', '610000005', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Bouetou B.', 'Thomas', 'thomas.bouetou@mutuelle.com', '610000006', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Boyomo O.', 'Marthe', 'marthe.boyomo@mutuelle.com', '610000007', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Chana', 'Anne Marie', 'annemarie.chana@mutuelle.com', '610000008', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Djotio', 'Thomas', 'thomas.djotio@mutuelle.com', '610000009', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ekobo', 'Brice', 'brice.ekobo@mutuelle.com', '610000010', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Etoua', 'Rémy', 'remy.etoua@mutuelle.com', '610000011', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Fandio', 'Bridinette', 'sbridine@yahoo.fr', '678933819', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Fippo', 'Fitime', 'fitime.fippo@mutuelle.com', '610000012', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Kammogne', 'Abraham', 'abraham.kammogne@mutuelle.com', '610000013', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Kenfack', 'Joseph', 'joseph.kenfack@mutuelle.com', '610000014', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Kenmeugne', 'Bienvenue', 'bienvenue.kenmeugne@mutuelle.com', '610000015', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Kouamou', 'Georges', 'georges.kouamou@mutuelle.com', '610000016', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Kuetche K.', 'Victor', 'victor.kuetche@mutuelle.com', '610000017', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Lele', 'Martial', 'martial.lele@mutuelle.com', '610000018', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Lezin', 'Minsili', 'minsili.lezin@mutuelle.com', '610000019', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Madjadoumbaye', 'J.', 'j.madjadoumbaye@mutuelle.com', '610000020', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'MANDENG MANDENG', 'Lucien', 'mandengl@yahoo.fr', '671049173', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mani Onana', 'Serge', 'serge.manionana@mutuelle.com', '610000021', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Manjia', 'Marceline', 'marceline.manjia@mutuelle.com', '610000022', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mbang', 'Théophile', 'theophile.mbang@mutuelle.com', '610000023', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mbinkar', 'EDWIN NYUYSEVER', 'mbinkaren@yahoo.fr', '677469921', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mbous Ikong', 'Jacques', 'jacques.mbousikong@mutuelle.com', '610000024', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Meukam', 'Pierre', 'pierre.meukam@mutuelle.com', '610000025', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mevaa', 'Lucien', 'lucien.mevaa@mutuelle.com', '610000026', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'MOUKOUOP NGUENA', 'Ibrahim', 'imoukouo@gmail.com', '699809291', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Mveh', 'Chantal', 'chantal.mveh@mutuelle.com', '610000027', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ndong', 'Guema', 'guema.ndong@mutuelle.com', '610000028', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ngabireng', 'C.M.', 'cm.ngabireng@mutuelle.com', '610000029', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Nganhou', 'Jean', 'jean.nganhou@mutuelle.com', '610000030', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ngnikam Ngnikam', 'Benjamin', 'benjamin.ngnikam@mutuelle.com', '610000031', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ngohe-Ekam', 'Paul S.', 'pauls.ngoheekam@mutuelle.com', '610000032', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'NGONO MVONDO epse ANDJOCK', 'Rachel Raïssa', 'rachel.ngono@univ-yaounde1.cm', '699653065', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ngounou', 'Guy Merlin', 'guymerlin.ngounou@mutuelle.com', '610000033', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Ntede', 'N. Hippolyte', 'nhippolyte.ntede@mutuelle.com', '610000034', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Onanena', 'Raïssa', 'raissa.onanena@univ-yaounde1.cm', '675239224', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Pettang', 'Chrepin', 'chrepin.pettang@mutuelle.com', '610000035', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Pettang Nana', 'Joyce', 'joyce.pettangnana@mutuelle.com', '610000036', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tagoudjeu', 'Jacques', 'jtagoudjeu@gmail.com', '699814218', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'TAKOU', 'Etienne', 'etienne.takou@gmail.com', '678582850', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tale Kalachi', 'Hervé', 'hervekalachi@gmail.com', '695381750', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Talla', 'André', 'atalla16034@gmail.com', '671216133', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tamo T.', 'Thomas', 'thomas.tamot@mutuelle.com', '610000037', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'TCHOMGO FELENOU', 'Emmanuel', 'mekempi@yahoo.fr', '699805936', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tchotang', 'Théodore', 'theodore.tchotang@mutuelle.com', '610000038', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tewa', 'Jean Jules', 'tewajules@gmail.com', '677711369', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tiedeu', 'Alain', 'alain.tiedeu@mutuelle.com', '610000039', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Tiogning epse Djiogue', 'Lauraine', 'lauraine.djiogue@univ-yaounde1.cm', '677669854', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'VIDEME BOSSOU', 'Olivier', 'obossou@gmail.com', '679921168', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Voufo', 'Joseph', 'voufojo1@gmail.com', '658184036', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Yatat Djeumen', 'Ivric Valaire', 'yatat.valaire@gmail.com', '675305726', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Yimen', 'Nasser', 'nasser.yimen@mutuelle.com', '610000040', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour'),
(UUID(), 'Elime bouboama', 'Aimé', 'aelime2001@yahoo.fr', '699892009', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', 0, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 'a jour')
ON DUPLICATE KEY UPDATE
    inscription_payee = 1,
    dette_inscription = 0.00,
    dette_solidarite = 0.00,
    mot_de_passe = VALUES(mot_de_passe);

-- Exercice 2026 (sans calcul automatique de renflouement)
INSERT INTO exercices (id, date_ouverture, statut)
SELECT UUID(), '2026-01-01 00:00:00', 'en cours'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM exercices WHERE statut = 'en cours');

-- Forcer inscription payée + dettes inscription/renflouement à 0 avant Excel
UPDATE membres
SET
    inscription_payee = 1,
    dette_inscription = 0.00,
    dette_solidarite = 0.00,
    solidarite_payee = 1;

-- Application Excel → dette_solidarite (dette unique solidarité/renflouement)
UPDATE membres SET dette_solidarite = 402000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('abraham.kammogne@mutuelle.com');
UPDATE membres SET dette_solidarite = 97500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('aelime2001@yahoo.fr');
UPDATE membres SET dette_solidarite = 242000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('benjamin.ngnikam@mutuelle.com');
UPDATE membres SET dette_solidarite = 393000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('bidoung@yahoo.com');
UPDATE membres SET dette_solidarite = 97500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('bienvenue.kenmeugne@mutuelle.com');
UPDATE membres SET dette_solidarite = 176500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('chantal.mveh@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('chrepin.pettang@mutuelle.com');
UPDATE membres SET dette_solidarite = 320500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('daniel.bitangaziem@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('didier.belobo@mutuelle.com');
UPDATE membres SET dette_solidarite = 25000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('etienne.takou@gmail.com');
UPDATE membres SET dette_solidarite = 80500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('fitime.fippo@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('florent.biyeme@mutuelle.com');
UPDATE membres SET dette_solidarite = 52500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('georges.kouamou@mutuelle.com');
UPDATE membres SET dette_solidarite = 242000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('guema.ndong@mutuelle.com');
UPDATE membres SET dette_solidarite = 367000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('hervekalachi@gmail.com');
UPDATE membres SET dette_solidarite = 153000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('imoukouo@gmail.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('j.madjadoumbaye@mutuelle.com');
UPDATE membres SET dette_solidarite = 280500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('jean.nganhou@mutuelle.com');
UPDATE membres SET dette_solidarite = 392000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('joseph.kenfack@mutuelle.com');
UPDATE membres SET dette_solidarite = 185000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('joyce.pettangnana@mutuelle.com');
UPDATE membres SET dette_solidarite = 408000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('lauraine.djiogue@univ-yaounde1.cm');
UPDATE membres SET dette_solidarite = 180500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('lucien.mevaa@mutuelle.com');
UPDATE membres SET dette_solidarite = 197500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('marceline.manjia@mutuelle.com');
UPDATE membres SET dette_solidarite = 368000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('martial.lele@mutuelle.com');
UPDATE membres SET dette_solidarite = 52500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('mbinkaren@yahoo.fr');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('nasser.yimen@mutuelle.com');
UPDATE membres SET dette_solidarite = 45000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('pauls.ngoheekam@mutuelle.com');
UPDATE membres SET dette_solidarite = 139000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('remy.etoua@mutuelle.com');
UPDATE membres SET dette_solidarite = 373000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('serge.manionana@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('stephane.atock@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('tewajules@gmail.com');
UPDATE membres SET dette_solidarite = 408000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('theodore.tchotang@mutuelle.com');
UPDATE membres SET dette_solidarite = 97500.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('thomas.bouetou@mutuelle.com');
UPDATE membres SET dette_solidarite = 362000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('thomas.djotio@mutuelle.com');
UPDATE membres SET dette_solidarite = 55000.00, solidarite_payee = 0 WHERE LOWER(couriel) = LOWER('victor.kuetche@mutuelle.com');

-- Recalcul drapeaux / états (etat basé sur dette_solidarite)
UPDATE membres
SET
    inscription_payee = 1,
    dette_inscription = 0.00,
    solidarite_payee = CASE WHEN dette_solidarite > 0 THEN 0 ELSE 1 END,
    etat = CASE
        WHEN dette_solidarite >= 250000 THEN 'Inactif'
        WHEN dette_solidarite > 0 THEN 'non a jour'
        ELSE 'a jour'
    END;

-- Comptes du bureau

SET @mid := (SELECT id FROM membres WHERE LOWER(couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm') LIMIT 1);
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
SELECT UUID(), 'PRESIDENT', 'Le président de la mutuelle', 'president@mutuelle.cm', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', @mid
FROM DUAL
WHERE @mid IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM postes WHERE intitule = 'PRESIDENT');

SET @mid := (SELECT id FROM membres WHERE LOWER(couriel) = LOWER('thomas.djotio@mutuelle.com') LIMIT 1);
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
SELECT UUID(), 'TRESORIER', 'Le trésorier de la mutuelle', 'tresorier@mutuelle.cm', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', @mid
FROM DUAL
WHERE @mid IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM postes WHERE intitule = 'TRESORIER');

SET @mid := (SELECT id FROM membres WHERE LOWER(couriel) = LOWER('annemarie.chana@mutuelle.com') LIMIT 1);
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
SELECT UUID(), 'SECRETAIRE_GENERAL', 'Le secrétaire général de la mutuelle', 'secretaire_general@mutuelle.cm', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', @mid
FROM DUAL
WHERE @mid IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM postes WHERE intitule = 'SECRETAIRE_GENERAL');

SET @mid := (SELECT id FROM membres WHERE LOWER(couriel) = LOWER('georges.kouamou@mutuelle.com') LIMIT 1);
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
SELECT UUID(), 'COMMISSAIRE_AUX_COMPTES', 'Le commissaire aux comptes de la mutuelle', 'commissaire_aux_comptes@mutuelle.cm', '$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa', @mid
FROM DUAL
WHERE @mid IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM postes WHERE intitule = 'COMMISSAIRE_AUX_COMPTES');

