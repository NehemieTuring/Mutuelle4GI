-- Flyway V17 : épargnes 2026 (Excel « Epargne 2026 », colonne Total 2026)
-- Valeur par membre = max(0, Total 2026)
-- Caisse épargnes = somme des épargnes membres

UPDATE membres SET epargne = 17308.00 WHERE LOWER(couriel) = LOWER('aelime2001@yahoo.fr');
UPDATE membres SET epargne = 359441.00 WHERE LOWER(couriel) = LOWER('alain.tiedeu@mutuelle.com');
UPDATE membres SET epargne = 1993920.00 WHERE LOWER(couriel) = LOWER('annemarie.chana@mutuelle.com');
UPDATE membres SET epargne = 1134567.00 WHERE LOWER(couriel) = LOWER('atalla16034@gmail.com');
UPDATE membres SET epargne = 8041.00 WHERE LOWER(couriel) = LOWER('benjamin.ngnikam@mutuelle.com');
UPDATE membres SET epargne = 2480160.00 WHERE LOWER(couriel) = LOWER('bernabe.batchakui@univ-yaounde1.cm');
UPDATE membres SET epargne = 33145.00 WHERE LOWER(couriel) = LOWER('bienvenue.kenmeugne@mutuelle.com');
UPDATE membres SET epargne = 538966.00 WHERE LOWER(couriel) = LOWER('brice.ekobo@mutuelle.com');
UPDATE membres SET epargne = 20497.00 WHERE LOWER(couriel) = LOWER('chantal.mveh@mutuelle.com');
UPDATE membres SET epargne = 295767.00 WHERE LOWER(couriel) = LOWER('charles.awono@mutuelle.com');
UPDATE membres SET epargne = 503.00 WHERE LOWER(couriel) = LOWER('chrepin.pettang@mutuelle.com');
UPDATE membres SET epargne = 80206.00 WHERE LOWER(couriel) = LOWER('didier.belobo@mutuelle.com');
UPDATE membres SET epargne = 38259.00 WHERE LOWER(couriel) = LOWER('etienne.takou@gmail.com');
UPDATE membres SET epargne = 17329.00 WHERE LOWER(couriel) = LOWER('fitime.fippo@mutuelle.com');
UPDATE membres SET epargne = 417219.00 WHERE LOWER(couriel) = LOWER('florent.biyeme@mutuelle.com');
UPDATE membres SET epargne = 33053.00 WHERE LOWER(couriel) = LOWER('georges.kouamou@mutuelle.com');
UPDATE membres SET epargne = 1000.00 WHERE LOWER(couriel) = LOWER('guema.ndong@mutuelle.com');
UPDATE membres SET epargne = 17007.00 WHERE LOWER(couriel) = LOWER('guymerlin.ngounou@mutuelle.com');
UPDATE membres SET epargne = 17702.00 WHERE LOWER(couriel) = LOWER('j.madjadoumbaye@mutuelle.com');
UPDATE membres SET epargne = 22739.00 WHERE LOWER(couriel) = LOWER('jacques.mbousikong@mutuelle.com');
UPDATE membres SET epargne = 880777.00 WHERE LOWER(couriel) = LOWER('jtagoudjeu@gmail.com');
UPDATE membres SET epargne = 7317715.00 WHERE LOWER(couriel) = LOWER('mandengl@yahoo.fr');
UPDATE membres SET epargne = 35897.00 WHERE LOWER(couriel) = LOWER('marceline.manjia@mutuelle.com');
UPDATE membres SET epargne = 962228.00 WHERE LOWER(couriel) = LOWER('marthe.boyomo@mutuelle.com');
UPDATE membres SET epargne = 5730.00 WHERE LOWER(couriel) = LOWER('mbinkaren@yahoo.fr');
UPDATE membres SET epargne = 56102.00 WHERE LOWER(couriel) = LOWER('mekempi@yahoo.fr');
UPDATE membres SET epargne = 89.00 WHERE LOWER(couriel) = LOWER('minsili.lezin@mutuelle.com');
UPDATE membres SET epargne = 70555.00 WHERE LOWER(couriel) = LOWER('nasser.yimen@mutuelle.com');
UPDATE membres SET epargne = 491756.00 WHERE LOWER(couriel) = LOWER('nhippolyte.ntede@mutuelle.com');
UPDATE membres SET epargne = 263759.00 WHERE LOWER(couriel) = LOWER('obossou@gmail.com');
UPDATE membres SET epargne = 1160888.00 WHERE LOWER(couriel) = LOWER('pauls.ngoheekam@mutuelle.com');
UPDATE membres SET epargne = 847618.00 WHERE LOWER(couriel) = LOWER('pierre.meukam@mutuelle.com');
UPDATE membres SET epargne = 57238.00 WHERE LOWER(couriel) = LOWER('rachel.ngono@univ-yaounde1.cm');
UPDATE membres SET epargne = 2558366.00 WHERE LOWER(couriel) = LOWER('raissa.onanena@univ-yaounde1.cm');
UPDATE membres SET epargne = 13025.00 WHERE LOWER(couriel) = LOWER('remy.etoua@mutuelle.com');
UPDATE membres SET epargne = 812532.00 WHERE LOWER(couriel) = LOWER('sbridine@yahoo.fr');
UPDATE membres SET epargne = 30050.00 WHERE LOWER(couriel) = LOWER('tewajules@gmail.com');
UPDATE membres SET epargne = 129098.00 WHERE LOWER(couriel) = LOWER('theophile.mbang@mutuelle.com');
UPDATE membres SET epargne = 4998.00 WHERE LOWER(couriel) = LOWER('thomas.bouetou@mutuelle.com');
UPDATE membres SET epargne = 1650957.00 WHERE LOWER(couriel) = LOWER('thomas.tamot@mutuelle.com');
UPDATE membres SET epargne = 38922.00 WHERE LOWER(couriel) = LOWER('victor.kuetche@mutuelle.com');
UPDATE membres SET epargne = 757635.00 WHERE LOWER(couriel) = LOWER('voufojo1@gmail.com');
UPDATE membres SET epargne = 375931.00 WHERE LOWER(couriel) = LOWER('yatat.valaire@gmail.com');

UPDATE parametres_generaux
SET caisse_epargnes = (
    SELECT IFNULL(SUM(epargne), 0.00) FROM membres
);
