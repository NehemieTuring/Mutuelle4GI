-- Flyway V19 : intérêts (Interets Cumules 2026) + emprunts (Emprunts 2026)
-- Source : Bilan_MEPY_2025-2026_v0_RO-1.xlsx
-- Intérêts :
--   epargne = max(0, Total Epargne)
--   interet = max(0, Total cumulé − Total Epargne)
-- Emprunts : un prêt par versement mensuel (aucun remboursement Excel → statut non remboursé)
-- dette membre = somme des prêts non remboursés

UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('abraham.kammogne@mutuelle.com');
UPDATE membres SET epargne = 17308.00, interet = 979.00 WHERE LOWER(couriel) = LOWER('aelime2001@yahoo.fr');
UPDATE membres SET epargne = 475441.00, interet = 20800.00 WHERE LOWER(couriel) = LOWER('alain.tiedeu@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('annemarie.chana@mutuelle.com');
UPDATE membres SET epargne = 534567.00, interet = 56855.00 WHERE LOWER(couriel) = LOWER('atalla16034@gmail.com');
UPDATE membres SET epargne = 8041.00, interet = 452.00 WHERE LOWER(couriel) = LOWER('benjamin.ngnikam@mutuelle.com');
UPDATE membres SET epargne = 2520160.00, interet = 139226.00 WHERE LOWER(couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('bidoung@yahoo.com');
UPDATE membres SET epargne = 33145.00, interet = 1878.00 WHERE LOWER(couriel) = LOWER('bienvenue.kenmeugne@mutuelle.com');
UPDATE membres SET epargne = 538966.00, interet = 15770.00 WHERE LOWER(couriel) = LOWER('brice.ekobo@mutuelle.com');
UPDATE membres SET epargne = 20497.00, interet = 1157.00 WHERE LOWER(couriel) = LOWER('chantal.mveh@mutuelle.com');
UPDATE membres SET epargne = 295767.00, interet = 16798.00 WHERE LOWER(couriel) = LOWER('charles.awono@mutuelle.com');
UPDATE membres SET epargne = 503.00, interet = 23.00 WHERE LOWER(couriel) = LOWER('chrepin.pettang@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('daniel.bitangaziem@mutuelle.com');
UPDATE membres SET epargne = 80206.00, interet = 4552.00 WHERE LOWER(couriel) = LOWER('didier.belobo@mutuelle.com');
UPDATE membres SET epargne = 38259.00, interet = 2170.00 WHERE LOWER(couriel) = LOWER('etienne.takou@gmail.com');
UPDATE membres SET epargne = 17329.00, interet = 980.00 WHERE LOWER(couriel) = LOWER('fitime.fippo@mutuelle.com');
UPDATE membres SET epargne = 417219.00, interet = 23565.00 WHERE LOWER(couriel) = LOWER('florent.biyeme@mutuelle.com');
UPDATE membres SET epargne = 33053.00, interet = 1873.00 WHERE LOWER(couriel) = LOWER('georges.kouamou@mutuelle.com');
UPDATE membres SET epargne = 1000.00, interet = 52.00 WHERE LOWER(couriel) = LOWER('guema.ndong@mutuelle.com');
UPDATE membres SET epargne = 17007.00, interet = 962.00 WHERE LOWER(couriel) = LOWER('guymerlin.ngounou@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('hervekalachi@gmail.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('imoukouo@gmail.com');
UPDATE membres SET epargne = 17702.00, interet = 1001.00 WHERE LOWER(couriel) = LOWER('j.madjadoumbaye@mutuelle.com');
UPDATE membres SET epargne = 22739.00, interet = 1287.00 WHERE LOWER(couriel) = LOWER('jacques.mbousikong@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('jean.nganhou@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('joseph.kenfack@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('joyce.pettangnana@mutuelle.com');
UPDATE membres SET epargne = 880777.00, interet = 47917.00 WHERE LOWER(couriel) = LOWER('jtagoudjeu@gmail.com');
UPDATE membres SET epargne = 51369.00, interet = 1488.00 WHERE LOWER(couriel) = LOWER('kameni.jaures@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('lauraine.djiogue@univ-yaounde1.cm');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('mandengl@yahoo.fr');
UPDATE membres SET epargne = 35897.00, interet = 2036.00 WHERE LOWER(couriel) = LOWER('marceline.manjia@mutuelle.com');
UPDATE membres SET epargne = 1002228.00, interet = 55107.00 WHERE LOWER(couriel) = LOWER('marthe.boyomo@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('martial.lele@mutuelle.com');
UPDATE membres SET epargne = 5730.00, interet = 321.00 WHERE LOWER(couriel) = LOWER('mbinkaren@yahoo.fr');
UPDATE membres SET epargne = 56102.00, interet = 3183.00 WHERE LOWER(couriel) = LOWER('mekempi@yahoo.fr');
UPDATE membres SET epargne = 89.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('minsili.lezin@mutuelle.com');
UPDATE membres SET epargne = 70555.00, interet = 4004.00 WHERE LOWER(couriel) = LOWER('nasser.yimen@mutuelle.com');
UPDATE membres SET epargne = 491756.00, interet = 27932.00 WHERE LOWER(couriel) = LOWER('nhippolyte.ntede@mutuelle.com');
UPDATE membres SET epargne = 263759.00, interet = 14980.00 WHERE LOWER(couriel) = LOWER('obossou@gmail.com');
UPDATE membres SET epargne = 1160888.00, interet = 65583.00 WHERE LOWER(couriel) = LOWER('pauls.ngoheekam@mutuelle.com');
UPDATE membres SET epargne = 847618.00, interet = 46591.00 WHERE LOWER(couriel) = LOWER('pierre.meukam@mutuelle.com');
UPDATE membres SET epargne = 57238.00, interet = 3108.00 WHERE LOWER(couriel) = LOWER('rachel.ngono@univ-yaounde1.cm');
UPDATE membres SET epargne = 2868366.00, interet = 142334.00 WHERE LOWER(couriel) = LOWER('raissa.onanena@univ-yaounde1.cm');
UPDATE membres SET epargne = 13025.00, interet = 736.00 WHERE LOWER(couriel) = LOWER('remy.etoua@mutuelle.com');
UPDATE membres SET epargne = 832532.00, interet = 43193.00 WHERE LOWER(couriel) = LOWER('sbridine@yahoo.fr');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('serge.manionana@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('stephane.atock@mutuelle.com');
UPDATE membres SET epargne = 30050.00, interet = 1703.00 WHERE LOWER(couriel) = LOWER('tewajules@gmail.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('theodore.tchotang@mutuelle.com');
UPDATE membres SET epargne = 139098.00, interet = 6793.00 WHERE LOWER(couriel) = LOWER('theophile.mbang@mutuelle.com');
UPDATE membres SET epargne = 4998.00, interet = 279.00 WHERE LOWER(couriel) = LOWER('thomas.bouetou@mutuelle.com');
UPDATE membres SET epargne = 0.00, interet = 0.00 WHERE LOWER(couriel) = LOWER('thomas.djotio@mutuelle.com');
UPDATE membres SET epargne = 1700957.00, interet = 88448.00 WHERE LOWER(couriel) = LOWER('thomas.tamot@mutuelle.com');
UPDATE membres SET epargne = 38922.00, interet = 2207.00 WHERE LOWER(couriel) = LOWER('victor.kuetche@mutuelle.com');
UPDATE membres SET epargne = 757635.00, interet = 42481.00 WHERE LOWER(couriel) = LOWER('voufojo1@gmail.com');
UPDATE membres SET epargne = 375931.00, interet = 18009.00 WHERE LOWER(couriel) = LOWER('yatat.valaire@gmail.com');

UPDATE parametres_generaux
SET caisse_epargnes = (
    SELECT IFNULL(SUM(epargne), 0.00) FROM membres
);

SET @exercice_id := (SELECT id FROM exercices WHERE statut = 'en cours' LIMIT 1);

INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2026-01-01 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2026-01-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 3500000.00, '2026-04-04 12:00:00', m.id, @exercice_id, 'Emprunt', 3500000.00, DATE_ADD('2026-04-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 3500000.00, '2026-07-06 12:00:00', m.id, @exercice_id, 'Emprunt', 3500000.00, DATE_ADD('2026-07-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 400000.00, '2025-12-01 12:00:00', m.id, @exercice_id, 'Emprunt', 400000.00, DATE_ADD('2025-12-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('florent.biyeme@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 600000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 600000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('florent.biyeme@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 100000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 100000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('florent.biyeme@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2025-12-01 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2025-12-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('marthe.boyomo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-01-01 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-01-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('marthe.boyomo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-04-04 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-04-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('marthe.boyomo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2500000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 2500000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('marthe.boyomo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2500000.00, '2026-08-06 12:00:00', m.id, @exercice_id, 'Emprunt', 2500000.00, DATE_ADD('2026-08-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('marthe.boyomo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-01-01 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-01-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('annemarie.chana@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 3000000.00, '2026-07-06 12:00:00', m.id, @exercice_id, 'Emprunt', 3000000.00, DATE_ADD('2026-07-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('annemarie.chana@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1150000.00, '2025-12-01 12:00:00', m.id, @exercice_id, 'Emprunt', 1150000.00, DATE_ADD('2025-12-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('brice.ekobo@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2000000.00, '2025-12-01 12:00:00', m.id, @exercice_id, 'Emprunt', 2000000.00, DATE_ADD('2025-12-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('sbridine@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2000000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 2000000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('sbridine@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2000000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 2000000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('sbridine@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 250000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 250000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('mandengl@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1610000.00, '2026-04-04 12:00:00', m.id, @exercice_id, 'Emprunt', 1610000.00, DATE_ADD('2026-04-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('mandengl@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2210000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 2210000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('mandengl@yahoo.fr') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1500000.00, '2026-08-06 12:00:00', m.id, @exercice_id, 'Emprunt', 1500000.00, DATE_ADD('2026-08-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('pierre.meukam@mutuelle.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2150000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 2150000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('raissa.onanena@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 250000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 250000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('raissa.onanena@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-07-06 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-07-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('raissa.onanena@univ-yaounde1.cm') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2025-12-01 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2025-12-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('jtagoudjeu@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2026-03-04 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2026-03-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('jtagoudjeu@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 300000.00, '2026-06-05 12:00:00', m.id, @exercice_id, 'Emprunt', 300000.00, DATE_ADD('2026-06-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('jtagoudjeu@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 500000.00, '2026-05-05 12:00:00', m.id, @exercice_id, 'Emprunt', 500000.00, DATE_ADD('2026-05-05 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('atalla16034@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 2000000.00, '2026-08-06 12:00:00', m.id, @exercice_id, 'Emprunt', 2000000.00, DATE_ADD('2026-08-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('atalla16034@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 200000.00, '2026-01-01 12:00:00', m.id, @exercice_id, 'Emprunt', 200000.00, DATE_ADD('2026-01-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('obossou@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-02-01 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-02-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('obossou@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-04-04 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-04-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('obossou@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 1000000.00, '2026-08-06 12:00:00', m.id, @exercice_id, 'Emprunt', 1000000.00, DATE_ADD('2026-08-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('obossou@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 600000.00, '2026-01-01 12:00:00', m.id, @exercice_id, 'Emprunt', 600000.00, DATE_ADD('2026-01-01 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('yatat.valaire@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 600000.00, '2026-04-04 12:00:00', m.id, @exercice_id, 'Emprunt', 600000.00, DATE_ADD('2026-04-04 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('yatat.valaire@gmail.com') LIMIT 1;
INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, montant_a_rembourser, date_echeance, statut)
SELECT UUID(), 600000.00, '2026-07-06 12:00:00', m.id, @exercice_id, 'Emprunt', 600000.00, DATE_ADD('2026-07-06 12:00:00', INTERVAL 3 MONTH), 'non rembourse'
FROM membres m WHERE LOWER(m.couriel) = LOWER('yatat.valaire@gmail.com') LIMIT 1;

UPDATE membres m
SET dette = (
    SELECT IFNULL(SUM(p.montant_a_rembourser), 0.00)
    FROM prets p
    WHERE p.membre_id = m.id AND p.statut = 'non rembourse'
);
