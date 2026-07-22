-- Script SQL pour l'insertion des membres et des postes
-- Les UUIDs des membres sont générés dynamiquement et stockés dans des variables SQL 
-- afin de garantir la cohérence des clés étrangères pour les postes.

-- 1. Insertion des Membres
-- Bernabé Batchakui
SET @id_batchakui = UUID();
INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe)
VALUES (
    @id_batchakui, 
    'BATCHAKUI', 
    'Bernabé', 
    'bernabe.batchakui@univ-yaounde1.cm', 
    '677106463', 
    'MonMot2Passe!'
);

-- Anne Marie Chana
SET @id_chana = UUID();
INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe)
VALUES (
    @id_chana, 
    'CHANA', 
    'Anne Marie', 
    'anne.chana@univ-yaounde1.cm', 
    '675097283', 
    'MonMot2Passe!'
);

-- Thomas Djotio
SET @id_djotio = UUID();
INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe)
VALUES (
    @id_djotio, 
    'DJOTIO', 
    'Thomas', 
    'thomas.djotio@univ-yaounde1.cm', 
    '694554537', 
    'MonMot2Passe!'
);

-- Edouard Kouamou
SET @id_kouamou = UUID();
INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe)
VALUES (
    @id_kouamou, 
    'KOUAMOU', 
    'Edouard', 
    'edouard.kouamou@univ-yaounde1.cm', 
    '677106463', 
    'MonMot2Passe!'
);


-- 2. Insertion des Postes
-- PRESIDENT (lié à Bernabé Batchakui)
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
VALUES (
    UUID(), 
    'PRESIDENT', 
    'Le president de la mutuelle', 
    'president@mutuelle.com', 
    'MonMot2Passe!', 
    @id_batchakui
);

-- TRESORIER (lié à Thomas Djotio)
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
VALUES (
    UUID(), 
    'TRESORIER', 
    'Le tresorier de la mutuelle', 
    'tresorier@mutuelle.com', 
    'MonMot2Passe!', 
    @id_djotio
);

-- SECRETAIRE_GENERAL (lié à Anne Marie Chana)
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
VALUES (
    UUID(), 
    'SECRETAIRE_GENERAL', 
    'Le secretaire general de la mutuelle', 
    'secretaire_general@mutuelle.com', 
    'MonMot2Passe!', 
    @id_chana
);

-- COMMISSAIRE_AUX_COMPTES (lié à Edouard Kouamou)
INSERT INTO postes (id, intitule, description, login, mot_de_passe, membre_id)
VALUES (
    UUID(), 
    'COMMISSAIRE_AUX_COMPTES', 
    'Le commissaire aux comptes de la mutuelle', 
    'commissaire_aux_comptes@mutuelle.com', 
    'MonMot2Passe!', 
    @id_kouamou
);
