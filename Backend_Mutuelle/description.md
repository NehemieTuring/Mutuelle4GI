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
- la duree maximale d'un emprunt (en nombre de mois, obligatoire, par defaut 3)
nb : il y'a une seule instance de cette table


# Les tests 
Il faut tester tous les aspects sur chaque table : 
- Les insertions (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les mises a jour (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les suppressions (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)
- Les recuperations (en prenant en compte tous les scenariis sur les contraintes que doit respecter la table)

# Membres a inserer 
1. nom : BATCHAKUI, prenom :  Bernabé, couriel : bernabe.batchakui@univ-yaounde1.cm, telephone : 677106463, mot de passe : MonMot2Passe! (ici, le mot de passe n'est pas encore hache)
2. nom : CHANA, prenom : Anne Marie, couriel : anne.chana@univ-yaounde1.cm, telephone : 675097283, mot de passe :  MonMot2Passe! 
3. nom : DJOTIO, prenom :  Thomas, couriel : thomas.djotio@univ-yaounde1.cm, telephone : 694554537, mot de passe :  MonMot2Passe!  
4. nom : KOUAMOU, prenom : Edouard, couriel : edouard.kouamou@univ-yaounde1.cm, telephone : 677106463, mot de passe :  MonMot2Passe! 

# postes a inserer
1. intitule : PRESIDENT, description : Le president de la mutuelle, login : president@mutuelle.cm, mot de passe : MonMot2Passe!, membre : uuid de bernabe batchakui
2. intitule : TRESORIER, description : Le tresorier de la mutuelle, login : tresorier@mutuelle.cm, mot de passe : MonMot2Passe!, membre : uuid de thomas djotio
3. intitule : SECRETAIRE_GENERAL, description : Le secretaire general de la mutuelle, login : secretaire_general@mutuelle.cm, mot de passe : MonMot2Passe!, membre : uuid de anne chana
4. intitule : COMMISSAIRE_AUX_COMPTES, description : Le commissaire aux comptes de la mutuelle, login : commissaire_aux_comptes@mutuelle.cm, mot de passe : MonMot2Passe!, membre : uuid de edouard kouamou


# Procedure de creation d'un membre
on rajoute un champ boolean : compte_verifie et un autre champ boolean : inscription_payee.
le secretaire general renseigne le formulaire de creation du membre : nom, prenom. mail, telephone, photo. 
lorsque le sg renseigne le formualire de creation d'un membre, il precise si l'inscription du membre est payee (autrememt dit, le champ inscription_payee dans les donnees fournies a la creation est optionnel). si ce champ n'est pas renseigne on le met a false.
par defaut a la creation, le champ compte_verifie est a false (a noter que ce champ n'est pas renseigne dans le formulaire)
le systeme genere un mot de passe aleatoire (ici nous prendons toujours comme mot de passe : MonMot2Passe!)
on n'envoi les parametres de connexion du membre par mail (pour le moment nous allons nous contenter d'ecrire dans les logs puisque nous n'envoyons pas encore de mail)
- une fois le membre connecte (avec ses identifiants recus par mail) on lui demande de modifier son mot de passe pour un mot de passe de son choix. Lorsqu'il le fait, le systeme met a jour le champ 'compte_verifie' du membre a true. et on lui affiche un message de succes. 

# Procedure de paiement de l'inscription par un membre
- le membre demande a creer son inscription 
- on lui demande affiche le montant de l'inscription (il faut donc ajouter un endpoint specifique qui retourne le montant de l'inscription depuis la table `parametres_generaux`)
- Le membre clique sur 'payer mon insciption', on cree une entree dans la table `versements` avec le statut en_attente, le montant de l'inscription, la date actuelle, l'identifiant du membre et la raison inscription. (il vaudra bien verifie que le montant recu par le endpoint correspond bien au montant de l'inscription, pas plus pas moins)
- le tresorier recoit une notification et va dans son tableau de bord pour consulter les versements en attente.
- Le tresorier clique sur le bouton 'accepter' le versement. 
- le systeme modifie le statut du versement en 'accepte'.
- le systeme met a jour le champ 'inscription_payee' du membre a true.
- si le tresorier refuse le versement, le systeme modifie le statut du versement en 'refuse'
- une fois le versement accepte, le montant dans la caisse des inscriptions augmente (montant existant + montant du versement)


# La table `versements`
cette table a les champs suivants : 
- l'identifiant (en uuid, automatique)
- le montant du versement (en nombre, obligatoire)
- la date du versement (en date, obligatoire, par defaut la date actuelle)
- l'identifiant du membre qui effectue le versement (en uuid, obligatoire, fait reference a la table `membres`)
- la raison du versement (parmi les valeurs suivantes : inscription, epargne, solidarite, remboursement)
- le statut du versement (parmi les valeurs suivantes : en_attente, accepte, refuse)
- Une description (ou motif) du versement (chaine de caracteres, optionnel)

#  Procedure de paiement de la solidarite d'un membre
- rajouter un champ dans la table `membres` (solidarite payee : boolean, par defaut false) qui dit si le membre a paye sa solidarite 
- rajouter un champ 'dette_solidarite' et un autre champ 'dette_inscription' dans la table `membres`. ces champs contiendront respectivement la somme des versements en attente (ce qu'il manque a payer par le membre)pour la solidarite et l'inscription. ainsi, on rajoute au scenario precedent de paiement de l'inscription, le fait de decrementer le champ 'dette_inscription' du montant du versement accepte (donc ce champ est a 0 lorsque l'inscription est entierement payee). lors de la creation du membre, on met par defaut les champs dette_solidarite et dette_inscription respectivement au montant de la solidarite et de l'inscription de la tabble des parametres generaux 
- le membre demande a payer sa solidarite
- on lui affiche le montant de la solidarite (il faut donc ajouter un endpoint specifique qui retourne le montant de la solidarite depuis la table `parametres_generaux`)
- Le membre clique sur 'payer ma solidarite', on cree une entree dans la table `versements` avec le statut en_attente, le montant de la solidarite, la date actuelle, l'identifiant du membre et la raison solidarite. (on peut payer la solidarite plusieurs fois, donc on peut accepter un versement pour solidarite dont le montant est inferieur au montant requis)
- le tresorier recoit une notification et va dans son tableau de bord pour consulter les versements en attente.
- Le tresorier clique sur le bouton 'accepter' le versement. 
- le systeme modifie le statut du versement en 'accepte'.
- le systeme met a jour le champ 'dette_solidarite' du membre en soustrayant le montant du versement accepte.
- si la dette_solidarite est maintenant a 0, on met a jour le champ 'solidarite_payee' du membre a true.
- si le tresorier refuse le versement, le systeme modifie le statut du versement en 'refuse'
- une fois le versement accepte, le montant dans la caisse des solidarites augmente (montant existant + montant du versement)


# Procedure de paiement de l'epargne d'un membre
- le membre demande a epargner de l'argent
- on lui demande le montant qu'il souhaite epargner
- Le membre renseigne le formulaire et clique sur 'payer mon epargne', on cree une entree dans la table `versements` avec le statut en_attente, le montant de l'epargne, la date actuelle, l'identifiant du membre et la raison epargne. 
- le tresorier recoit une notification et va dans son tableau de bord pour consulter les versements en attente.
- Le tresorier clique sur le bouton 'accepter' le versement. 
- le systeme modifie le statut du versement en 'accepte'.
- le systeme met a jour le champ 'epargne' du membre en ajoutant le montant du versement accepte. (rajouter donc ce champ dans la table des membres, et l'initialiser a 0 a la creation, valeur par defaut)
- si le tresorier refuse le versement, le systeme modifie le statut du versement en 'refuse'
- une fois le versement accepte, le montant dans la caisse des epargnes augmente (montant existant + montant du versement)

# Procedure de changement d'etat d'un membre
- si la dette_solidarite du membre est superieure ou egale a 250 000, l'etat du membre passe a 'Inactif'
- si la dette_solidarite du membre est inferieure a 250 000 mais strictement positive, l'etat du membre passe a 'non a jour'
- si la dette_solidarite du membre est nulle, l'etat du membre passe a 'a jour'

# Procedure de demande d'une aide par un membre
- le membre demande a obtenir une aide
- on verifie que : 
    - le membre a paye son inscription
    - le membre a paye sa solidarite
- si le membre ne remplit pas ces conditions, on l'informe qu'il ne peut pas solliciter une aide (en precisant la raison). il faut donc un endpoint qui teste si un membre peut ou pas demander une aide 
- s'il peut beneficier d'une aide, on lui demande la raison de l'aide (cette raison doit exister dans la table des parametres des aides, donc on affiche les raisons d'aides existantes pour que le membre en choisisse une). Il faut donc un endpoint qui retourne les raisons d'aides existantes.
- on verifie que le montant dans la caisse de solidarites est superieur ou egale au montant de l'aide choisi par le membre. si c'est le cas, on continue, sinon on informe le membre qu'il ne peut pas beneficier de l'aide car il n'y a pas assez de liquidites dans la caisse de solidarites 
- Une sortie est creee avec le statut en_attente_secretaire_general et la raison est aide_<raison_choisie>.  le montant de la sortie est le montant de l'aide choisi par le membre.  une fois la sortie creee, le secretaire general peut l'accepter ou la refuser.  si le secretaire general l'accepte, le statut devient en_attente_tresorier, et le tresorier peut l'accepter ou la refuser.  si le tresorier l'accepte, le statut devient accepte, et le membre peut recevoir l'aide.
- apres que le membre recoit l'aide, il doit utiliser l'endpoint pour changerle statut. lors de ce changement de statut par le membre, voici ce qui se passe : 
    - si la sortie est pour une aide (comme c'est le cas ici), on va dans la caisse des solidarites, on retire le montant de l'aide (le nouveau montant devien ancien - montant de l'aide)

# table contenant les parametres des aides

avec les champs suivants : 
- type d'aide
- montant de l'aide
- identifiant unique
lors de la creation de cette table, placons les aides suivantes : (que l'on pourra modifier par la suite)
- deces : 500 000 FCFA
- maladie : 100 000 FCFA
- mariage : 50 000 FCFA 

# la table des sorties 

Cette table va contenir les sorties de la mutuelle
- Identifiant unique 
- Montant de la sortie
- Date de la sortie
- Identifiant du membre qui a sollicite la sortie
- Raison de la sortie
- Statut de la sortie (en_attente_secretaire_general, en_attente_tresorier, accepte_par_sg_refuse_par_tr, accepte_par_sg_accepte_par_tr, refuse_par_sg_accepte_par_tr, refuse_par_sg_refuse_par_tr, recue_par_membre). lorsque l'on cree la sortie, le statut est mis par defaut a 'en_attente_secretaire_general'.  lorsque le secretaire general refuse la sortie, le statut devient 'refuse_par_sg_refuse_par_tr'.  lorsque le secretaire general accepte la sortie, le statut devient 'attente_tresorier'.  lorsque le tresorier accepte la sortie, le statut devient 'accepte_par_sg_accepte_par_tr'.  lorsque le tresorier refuse la sortie, le statut devient 'accepte_par_sg_refuse_par_tr'.  lorsque le membre recoit la sortie, il clique sur 'confirmer' et le statut devient 'recue_par_membre'.  ainsi, il faut un endpoint pour chaque changement de statut possible (accepter_sg, refuser_sg, accepter_tr, refuser_tr, confirmer_membre etc)

# La table des prets

avec les champs suivants : 
- Identifiant unique 
- Montant de l'emprunt
- Date de l'emprunt
- Identifiant du membre qui a emprunte
- Raison de l'emprunt
- Montant total a rembourse (le montant de l'emprunt + les interets)
- date d'echeance (on calcule automatiquement cette date. Pour cela, on prendra la date actuelle et on lui ajoutera le nombre de mois our le remboursement de l'emprunt, a recuperer dans la table des parametres generaux). il faut bien stocker la date d'echeance! pas le nombre de jours ou de mois!
- Statut du pret (rembourse, non rembourse). par defaut non rembourse

# Procedure de demande d'un emprunt

- un membre demande un emprunt
- on verifie son eligibilite: 
    - doit avoir paye son inscription
    - doit avoir paye sa solidarite
    - sa dette_solidarite doit etre nulle
    - sa dette_inscription doit etre nulle
    - Il n'a aucun emprunt non rembourse
    - il faut un endpoint qui teste si un membre peut ou pas demander un pret
- s'il peut beneficier d'un pret, on lui demande le montant du pret (le montant demande doit etre au plus egal a 5 fois l'epargne actuelle du membre)
- si le montant demande est valide, on continue
- on verifie que le montant dans la caisse des epargnes est superieur ou egale au montant du pret choisi par le membre. si c'est le cas, on continue, sinon on informe le membre qu'il ne peut pas beneficier du pret car il n'y a pas assez de liquidites dans la caisse des epargnes 
- si il y a les liquidites, on cree une entree dans la table des sorties avec la raison 'pret', le montant de la sortie est le montant du pret choisi par le membre.  une fois la sortie creee, le secretaire general peut l'accepter ou la refuser.  si le secretaire general l'accepte, le statut devient en_attente_tresorier, et le tresorier peut l'accepter ou la refuser.  si le tresorier l'accepte, le statut devient accepte_par_sg_accepte_par_tr : la sequence s'arrete la (pas de confirmation de reception par le membre).  il faut donc un endpoint pour chaque changement de statut possible (accepter_sg, refuser_sg, accepter_tr, refuser_tr)
- si le secretaire general refuse la sortie, le statut devient refuse_par_sg_refuse_par_tr
- si le secretaire general accepte la sortie, le statut devient en_attente_tresorier
- si le tresorier accepte la sortie, le statut devient accepte_par_sg_accepte_par_tr
- si le tresorier refuse la sortie, le statut devient accepte_par_sg_refuse_par_tr
- lorsque le tresorier valide l'emprunt (statut accepte_par_sg_accepte_par_tr), on doit aussi diminuer le montant dans la caisse des epargnes du montant de l'emprunt, auquel on doit soustraire les interets de ce montant (le taux d'interet est a recuperer dans la table des parametres generaux). on doit aussi enregistrer l'emprunt dans la table des prets avec le statut non rembourse et la date d'echeance qui est egale a la date actuelle + le nombre de mois pour le remboursement de l'emprunt, a recuperer dans la table des parametres generaux. le montant a rembourser par le membre est egal au capital prete uniquement (sans les interets). la dette du membre est incrementee de ce meme capital. les interets sont redistribues aux autres epargnants.
- Une fois ceci fait, il faut repartir l'epargne entre les membres qui ont un epargne non nul. Pour cela, voici comment on procede : 
    - on calcule la part (le pourcentage) de l'epargne ce chaque membre (sauf le membre qui demande le pret) par rapport a l'epargne totale de tous les membres. On obtient par exemple un taux de x%.
    - on calcule l'interet sur le pret. Pour cela, on prend le taux d'interet dans la table des parametres generaux et on calcule le montant des interets a appliquer (il faut que ce montant soit un entier, donc on arrondit a l'entier inferieur). On obtient par exemple un montant de y FCFA.
    - on repartit l'interet entre les membres qui ont un epargne non nul. Pour cela, on multiplie le taux d'interet de chaque membre (obtenu a l'etape 1) par le montant des interets (obtenu a l'etape 2). On obtient par exemple un montant de z FCFA. Ce montant est ajouté a la valeur du champ 'interet' (nouveaux champ a creer dans la table des membres) de chaque membre qui a un epargne non nul.  

Ainsi, le montant total de l'argent d'un membre est egal a son epargne + les interets accumules. (il faut un  endpoint qui retourne cette somme)

# Procedure de retrait d'argent par un membre
Le membre demande a faire un retrait (il precise le montant qu'il veut retirer et la raison).
On verifie si ce membre peut retirer cette somme (pour cela, on se rassure que le montant demande est inferieur ou egal a son epargne).  
On cree l'entree dans la table des sorties (avec la raison 'retrait') et le statut en_attente_secretaire_general.
le secretaire general peut accepter ou refuser le retrait.
si le secretaire general accepte le retrait, le statut devient en_attente_tresorier.
si le secretaire general refuse le retrait, le statut devient refuse_par_sg_refuse_par_tr.
si le tresorier accepte le retrait, le statut devient accepte_par_sg_accepte_par_tr.
si le tresorier refuse le retrait, le statut devient accepte_par_sg_refuse_par_tr.
si le membre recoit le retrait, il clique sur 'confirmer' et le statut devient 'recue_par_membre'. 
Lors de ce changement de statut, on doit diminuer le montant de la caisse des epargnes du montant du retrait (lorsque le membre confirme et que le statut passe a 'recu_par_membre').
- lorsqu'un membre fait un retrait d'argent, il faut aussi diminuer le montant de ses epargnes et celui de ses interets. Pour le faire voici comment on procede : 
    - on calcul la part (le pourcentage) du montant demande par rapport a son epargne personnel total. On obtient par exemple x%
    - on diminue le montant de ses epargnes (nouveau montant epargne = ancien montant - montant retire)
    - on diminue de x% le montant de ses interets.  

# Procedure de remboursement d'un pret
## la table remboursement
- date et heure du remboursement
- l'emprunt auquel est lie le remboursement
- le montant rembours
- le statut du remboursement (en attente_tr, valide_tr). par defaut a en attente_tr (il faut donc un endpoint pour que le tresorier puisse valider le remboursement)
## prealable
ajouter un champ dette dans la table membre pour stocker les dettes d'emprunts du membre. Ainsi, a chaque emprunt (tel que nous l'avons implemente precedemment) on met a jour ce champ avec le montant de l'emprunt (par defaut le champ est a 0). ainsi, pour savoir si le membre a ou pas un emprunt non rembourse, on peut tout simplement verifier si la valeur de ce champ dans la ligne du membre est  a 0.
## procedure
- le membre demande a payer son remboursement
- il fournit le montant qu'il souhaite payer et precise l'id de l'emprunt auquel est lie le remboursement
- on recupere la somme entree par le membre, on verifie qu'il est inferieur ou egal a la valeur du champ 'dette du membre (sinon, on s'arrete et on retourne un message de non conformite du montant). si oui, on continue
- on met a jour la valeur du champ 'dette' du membre avec la formule suivante : nouvelle dette = ancienne dette - montant rembourse
- si la nouvelle dette est egale a 0, on considere le pret comme rembourse et on met a jour le statut de l'emprunt dans la table des prets avec la valeur 'rembourse' (on ajoute aussi la date du remboursement). si la nouvelle dette n'est pas egale a 0, on considere le pret comme non rembourse et on met a jour le statut de l'emprunt dans la table des prets avec la valeur 'non rembourse' (on ajoute aussi la date du remboursement).
- on augmente le montant de la caisse des epargnes du montant remboursé. 

# les exercices de la mutuelle
la table des exercices contient : 
- l'id
- la date d'ouverture
- la date de fermeture
- le statut (en cours, ferme).

Il ne doit jamais y avoir plus d'un exercice en cours en meme temps. Ainsi, on doit avoir: 
- 0 exercice en cours (cas ou on cloture l'ancien exercice et on ouvre un nouveau)
- 1 seul exercice en cours (cas normal)

Il n'est pas possible de cloturer un exercice s'il y a des prets en cours.  
Il n'est pas possible d'ouvrir un exercice s'il y a deja un exercice en cours.  
## procedure
- le secretaire general ouvre un exercice. 
- une fois l'exercice ouvert, les membres peuvent commencer a faire des versements et des retraits
- pour cloturer l'exercice, le secretaire general doit s'assurer qu'il n'y a pas de prets en cours. une fois que c'est le cas, il peut cloturer l'exercice.  
- lorsqu'on ouvre un exercice, le systeme calcule d'abord les dette_inscription et les dettes solidarite de chaque membre. Pour cela, voici comment on procede : 
    - on calcule la capacite maximale de la caisse de solidarite (cmax = montant solidarite dans parametresGeneraux * nombre de membres)
    - on calcule la capacite maximale de la caisse d'inscription (cmax = montant inscription dans parametresGeneraux * nombre de membres)
    - on divise la capacite maximale de la caisse de solidarite par le nombre de membres a jour (on arrondi a l'entier superieur). on obtient ainsi la part de chaque membre dans la caisse de solidarite.
    - on divise la capacite maximale de la caisse d'inscription par le nombre de membres a jour (on arrondi a l'entier superieur). on obtient ainsi la part de chaque membre dans la caisse d'inscription. 
    - si un membre avait deja une dette d'inscription ou de solidarite, le nouveau montant calcule est ajoute a cette dette, 
    - on ajoute cette nouvelle dette a la dette de chaque membre (selon les cas, la dette d'inscription ou de solidarite est ajoutee a la dette du membre, on verifie si son etat doit changer (est ce qu'il devient inactif, non a jour etc selon les regles precedemment definies)
    - apres creation de l'exercice on retourne les infos de l'exercices, ainsi que le montant nouvellement calcule de l'inscription et de la solidarite pour ce nouvel exercice.

- il faut rajouter un endpoint de creation de l'exercice (different du precedent) qui force la creation meme s'il y a des dette non remboursees. rien ne change dans la procedure de creation de l'exercice, juste que on ne refuse plus de creer sous pretexte qu'il y a des dettes