-- Répartition des parts d'intérêt par créancier (épargnants) au moment de l'octroi du prêt.
-- Format JSON : { "uuid_membre": pourcentage_part }  (ex. 0.35 = 35 % de la répartition)

ALTER TABLE prets
ADD COLUMN liste_creatiers JSON NULL;
