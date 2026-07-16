# Description de quelles tables de la bd

>  Note : Il faut utiliser flyway pour gerer les versions de la bd.

## table `membres`
cette table a les champs suivants : 
- nom (chaine de caracteres, obligatoire)
- prenom (chaine de caracteres, optionnel)
- couriel (adresse mail, obligatoire, doit respecter le format d'une adresse mail)
- telephone (numero de telephone, obligatoire)
- photo (chemin vers la photo de profil, optionnel, format .jpeg ou .png) 
- l'identifiant (en uuid, automatique)
- la date de creation (en date, obligatoire, par defaut la date actuelle)
- la date de derniere connexion (en date, obligatoire, par defaut la date actuelle)
- le mot de passe (chaine de caracteres, obligatoire, haché)

## table `postes`
- l'identifiant (en uuid, automatique)
- l'intitulé du poste (chaine de caracteres, obligatoire, prends des valeurs bien définies (voir plus bas), unique)
- la description du poste (chaine de caracteres, optionnelle)
- le login (le mail de connexion au compte, obligatoire, doit respecter le format d'une adresse mail)
- le mot de passe (chaine de caracteres, obligatoire, haché)
- la date de derniere connexion (en date, obligatoire, par defaut la date actuelle)
- la date de creation (en date, obligatoire, par defaut la date actuelle)
- l'identifiant du membre qui occupe le poste (en uuid, obligatoire, fait reference a la table `membres`)

nb : voici les valeurs d'intitule de postes : 
- SECRETAIRE_GENERAL
- TRESORIER
- PRESIDENT
- COMMISSAIRE_AUX_COMPTES

## table `parametres_generaux`
- l'identifiant (en uuid, automatique)
- le montant de l'inscription (en nombre, obligatoire, par defaut 50000)
- le montant de la solidarite (en nombre, obligatoire, par defaut 150000)
- le taux d'interet des emrpunts (en nombre, obligatoire, par defaut 0.03)
- le montant de la penalite de retard (en nombre, obligatoire, par defaut 15000)
- le facteur d'emprunt (le nombre par lequel on multiplie le montant de la cotisation pour obtenir le montant maximal d'emprunt, en nombre, obligatoire, par defaut 5)

nb : il y'a une seule instance de cette table


# Les tests 
Il faut tester tous les aspects sur chaque table : 
- Les insertions (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les mises a jour (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les suppressions (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les recuperations (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)

# Membres a inserer 
1. nom : BATCHAKUI, prenom :  Bernabé, couriel : bernabe.batchakui@univ-yaounde1.cm, telephone : 677106463, mot de passe : MonMot2Passse! (ici, le mot de passe n'est pas encore hache)
2. nom : CHANA, prenom : Anne Marie, couriel : anne.chana@univ-yaounde1.cm, telephone : 675097283, mot de passe :  MonMot2Passse! 
3. nom : DJOTIO, prenom :  Thomas, couriel : thomas.djotio@univ-yaounde1.cm, telephone : 694554537, mot de passe :  MonMot2Passse!  
4. nom : KOUAMOU, prenom : Edouard, couriel : edouard.kouamou@univ-yaounde1.cm, telephone : 677106463, mot de passe :  MonMot2Passse! 

# postes a inserer
1. intitule : PRESIDENT, description : Le president de la mutuelle, login : president@mutuelle.cm, mot de passe : MonMot2Passse!, membre : uuid de bernabe batchakui
2. intitule : TRESORIER, description : Le tresorier de la mutuelle, login : tresorier@mutuelle.cm, mot de passe : MonMot2Passse!, membre : uuid de thomas djotio
3. intitule : SECRETAIRE_GENERAL, description : Le secretaire general de la mutuelle, login : secretaire_general@mutuelle.cm, mot de passe : MonMot2Passse!, membre : uuid de anne chana
4. intitule : COMMISSAIRE_AUX_COMPTES, description : Le commissaire aux comptes de la mutuelle, login : commissaire_aux_comptes@mutuelle.cm, mot de passe : MonMot2Passse!, membre : uuid de edouard kouamou
