# Épargne fictive — proposition & questions client

Document de travail pour validation métier avant implémentation.  
*Rédigé à partir des consignes produit + questions d’éclaircissement techniques. Ne pas implémenter tant que le client n’a pas tranché.*

---

## 1. Objectif

Séparer ce que le membre « possède réellement » en épargne de ce qui reste **disponible pour contribuer aux prêts** des autres, sans toucher au solde d’épargne affiché / retirable lors de l’accord d’un emprunt.

---

## 2. Proposition produit (consignes)

### 2.1 Champ membre `epargneFictif`

- Ajouter un champ **`epargne fictif`** (`epargneFictif`) dans la table `membres`.
- **Initialisation** : même valeur que le champ `epargne` du membre.
- **Versement d’épargne** : `epargne` et `epargneFictif` augmentent de la même façon.
- **Retrait** : `epargne` et `epargneFictif` diminuent de la même façon.

### 2.2 Différence à l’emprunt

Lorsqu’un membre demande / obtient un emprunt :

1. On constitue l’argent à prêter en prélevant auprès de **chaque autre membre** (sauf le demandeur).
2. La part de contribution d’un membre est calculée sur son **épargne fictive**, pas sur son épargne réelle :
   - Si l’épargne fictive de Karlyn représente **x %** de l’ensemble des épargnes fictives (contexte à préciser — voir questions),
   - alors Karlyn contribue à **x %** du montant du prêt.
3. Une fois le prêt **accordé** :
   - on diminue l’**épargne fictive** des contributeurs :  
     `nouvelle epargneFictif = ancienne epargneFictif − contribution au prêt` ;
   - on **ne touche pas** à l’**épargne** réelle du membre.

### 2.3 Caisse d’épargne fictive

- Créer une **`caisseEpargnesFictif`** (paramètres généraux / caisse globale).
- Elle évolue **comme** la caisse des épargnes (`caisseEpargnes`) **sauf lors des emprunts**.
- À l’emprunt :
  - on vérifie que la **caisse d’épargne fictive** peut satisfaire la demande (**ainsi que** celle des épargnes — formulation à clarifier, voir questions) ;
  - après accord du prêt, on débite l’argent dans la **caisse des épargnes fictives**, **pas** dans la caisse des épargnes réelles.

---

## 3. Comportement attendu (résumé opérationnel)

| Événement                         | `epargne` (réel) | `epargneFictif` | `caisseEpargnes` | `caisseEpargnesFictif` |
|-----------------------------------|------------------|-----------------|------------------|-------------------------|
| Init / migration                  | inchangé         | = `epargne`     | inchangé         | = `caisseEpargnes` *(à confirmer)* |
| Versement épargne accepté         | + montant        | + montant       | + montant        | + montant               |
| Retrait accepté                   | − montant        | − montant       | − montant        | − montant               |
| Emprunt accordé (contributeurs)   | **inchangé**     | − contribution  | **inchangé** *(à confirmer)* | − montant du prêt *(détail intérêts à confirmer)* |
| Emprunt accordé (emprunteur)      | inchangé *(hors dette)* | inchangé (pas de contribution) | ? | ? |

---

## 4. Questions à trancher avec le client

### Q1 — Moment du prélèvement fictif

Le calcul et la diminution de l’épargne fictive (et de la caisse fictive) se font-ils :

- à la **demande** d’emprunt,
- à l’**acceptation du secrétaire général**,
- ou seulement à l’**acceptation du trésorier** (finalisation actuelle du prêt) ?

### Q2 — Double contrôle de liquidité

« Vérifier la caisse fictive **plus** celle des épargnes » signifie-t-il :

- que **les deux** caisses doivent être ≥ au montant du prêt, ou
- que seule la caisse **fictive** conditionne l’accord, la caisse réelle servant à autre chose ?

### Q3 — Caisse réelle à l’accord du prêt

Aujourd’hui, à l’accord TR, on débite souvent `caisseEpargnes` de *(capital − intérêts)*.  
Avec le nouveau modèle : **ne touche-t-on plus du tout** à `caisseEpargnes` à l’accord du prêt (débit uniquement sur `caisseEpargnesFictif`) ?

### Q4 — Intérêts du prêt

Que devient la redistribution des intérêts aux autres épargnants ?

- Sur l’épargne / intérêts **réels** comme aujourd’hui ?
- Aussi / seulement sur le **fictif** ?
- D’où sort l’argent des intérêts si la caisse réelle n’est plus débitée à l’emprunt ?

### Q5 — Remboursement du prêt

Quand le membre rembourse :

- on crédite seulement `caisseEpargnes` (comme aujourd’hui), ou
- on crédite aussi `caisseEpargnesFictif` et on **restaure** l’épargne fictive des contributeurs (au prorata de leur contribution initiale) ?

### Q6 — Plafond de retrait après divergence

Après des prêts, `epargne` peut être **supérieure** à `epargneFictif`.  
Le membre peut-il retirer jusqu’à son **épargne réelle**, ou seulement jusqu’à `min(epargne, epargneFictif)` ?

### Q7 — Base du pourcentage de contribution

Confirmer la formule :

- `% = epargneFictif_membre / Σ épargnes fictives **hors demandeur**` ?
- Le % s’applique au **capital** demandé, ou au montant sorti de caisse *(capital − intérêts)* ?

### Q8 — Migration des données existantes

Pour les membres et caisses déjà en base :

- `epargneFictif = epargne` pour tous les membres ?
- `caisseEpargnesFictif = caisseEpargnes` ?

### Q9 — Arrondis

Si la somme des contributions arrondies ≠ montant exact du prêt, comment ajuster (dernier contributeur, plus gros contributeur, autre règle) ?

---

## 5. Hors scope pour l’instant

- **Pas d’implémentation** tant que ce document n’est pas validé / amendé par le client.
- Les règles actuelles d’emprunt / remboursement restent en place en attendant.

---

## 6. Décisions client (à remplir)

| # | Question | Décision | Date |
|---|----------|----------|------|
| Q1 | Moment du prélèvement | | |
| Q2 | Double contrôle de caisse | | |
| Q3 | Caisse réelle à l’emprunt | | |
| Q4 | Intérêts | | |
| Q5 | Remboursement / restauration fictive | | |
| Q6 | Plafond de retrait | | |
| Q7 | Formule du % | | |
| Q8 | Migration | | |
| Q9 | Arrondis | | |

---

*Fichier destiné à la consultation client. Mettre à jour la section 6 après le retour, puis démarrer l’implémentation.*
