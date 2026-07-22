# Guide du Design System - Mutuelle ENSPY

Ce document définit les règles de style, la charte graphique et les tokens de design de l'application **Mutuelle ENSPY**. L'interface est conçue pour être moderne, épurée et sans bordures excessives, privilégiant les ombres douces et les contrastes de fonds pour structurer les éléments.

---

## 1. Tokens de Design (Variables CSS)

Les variables globales sont définies dans `:root` au sein du fichier `index.css`.

### A. Palette de Couleurs

| Variable | Couleur | Code Hex | Usage / Rôle |
| :--- | :--- | :--- | :--- |
| `--primary` | Navy Foncé | `#0D1F3C` | Arrière-plan Sidebar, Titres principaux, Boutons primaires |
| `--primary-light`| Navy Moyen | `#1A3357` | Hover Sidebar, Avatar, Focus formulaires |
| `--accent` | Turquoise / Teal| `#2DD4BF` | Éléments actifs, Liens mis en valeur, Toggles actifs |
| `--success` | Vert Émeraude | `#10B981` | Badges de succès, Indicateurs de session active, Remboursements complets |
| `--warning` | Orange Foncé | `#F59E0B` | Badges d'alerte, Statuts en attente de validation |
| `--error` | Rouge Corail | `#EF4444` | Badges d'erreur, Boutons de suppression, Actions irréversibles |
| `--info` | Bleu Royal | `#3B82F6` | Badges d'information générale, Liens neutres |
| `--bg-app` | Blanc-Gris | `#F9FAFB` | Arrière-plan de toute l'application |
| `--bg-card` | Blanc Pur | `#FFFFFF` | Arrière-plan des cartes, tables, modals et formulaires |
| `--border` | Gris Très Clair| `#E5E7EB` | Lignes de séparation discrètes (utilisées uniquement si nécessaire) |

### B. Couleurs de Texte

| Variable | Couleur | Code Hex | Usage / Rôle |
| :--- | :--- | :--- | :--- |
| `--text-main` | Anthracite | `#111827` | Texte principal de lecture, valeurs |
| `--text-muted` | Gris Neutre | `#6B7280` | Sous-titres, libellés de stats, légendes |
| `--text-light` | Gris Clair | `#9CA3AF` | Rôles utilisateur, textes d'accompagnement mineurs |

### C. Ombres Portées (Elevations)

L'application n'utilise pas de bordures visibles pour délimiter ses cartes et conteneurs. La séparation se fait par des ombres portées et le contraste de couleurs.

* **`--shadow-sm`** : `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Utilisé pour les tableaux et petites cartes)
* **`--shadow-md`** : `0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)` (Hover de cartes)
* **`--shadow-lg`** : `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)` (Sidebar, headers fixes)
* **`--shadow-xl`** : `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` (Fenêtres modales, carte de connexion)

### D. Typographie

* **Famille de Polices** : `'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* **Lissage** : Antialiasing activé sur tous les navigateurs (`-webkit-font-smoothing: antialiased`).

---

## 2. Structure & Layouts

### A. Écran de Connexion (`.login-container`)
* **Fond** : Dégradé radial sombre (`radial-gradient(circle at 10% 20%, var(--primary-light) 0%, var(--primary) 90%)`) avec un effet de bulle floutée à l'arrière (`background: rgba(45, 212, 191, 0.03)`).
* **Carte (`.login-card`)** : Semi-transparente (`rgba(255, 255, 255, 0.95)`), à coins arrondis (`16px`), sans bordure dure, avec une ombre intense (`--shadow-xl`).

### B. Mise en page principale (`.app-layout`)
* **Sidebar (`.sidebar`)** : Largeur fixe de `260px`, fixée sur le côté gauche. Couleur de fond sombre (`--primary`). Les éléments de menu actifs ont une bordure gauche colorée (`4px solid var(--accent)`) et une couleur de fond légèrement éclaircie.
* **Zone Principale (`.main-container`)** : Prend le reste de la largeur (`margin-left: 260px`).
* **Header (`.app-header`)** : Hauteur fixe de `70px`, fond blanc, collant en haut de page, avec indicateur de session verte clignotante (`animation: pulse 1.8s infinite`).

---

## 3. Composants Graphiques

### A. Cartes statistiques (`.stat-card`)
Ces cartes affichent les montants des caisses ou les indicateurs clés.
* **Bordures** : Aucune (`border: none`).
* **Animations** : Transition fluide au survol qui translate la carte de `2px` vers le haut et renforce l'ombre (`--shadow-md`).

### B. Formulaires & Entrées
* **Champs de saisie (`.form-control`)** : Bords arrondis (`8px`), bordure gris clair. Au focus, s'illumine avec la couleur `--primary` et un halo doux (`box-shadow: 0 0 0 3px rgba(13, 31, 60, 0.08)`).
* **Boutons (`.btn`)** : Coins arrondis (`8px`), texte gras (`600`).
  - **Primaire (`.btn-primary`)** : Couleur navy, devient plus clair au survol.
  - **Secondaire (`.btn-secondary`)** : Bordure colorée sans fond.
  - **Danger (`.btn-danger`)** : Fond rouge corail pour les rejets ou suppressions.

### C. Badges de Statut (`.badge`)
Affichent l'état des membres, des aides ou des versements. Ils utilisent une couleur de fond à opacité très faible (`12%`) et un texte coloré à pleine opacité.
* **Success** : Fond vert à `12%`, texte vert (`--success`).
* **Warning** : Fond jaune à `12%`, texte jaune (`--warning`).
* **Danger** : Fond rouge à `12%`, texte rouge (`--error`).
* **Info** : Fond bleu à `12%`, texte bleu (`--info`).

### D. Tableaux de Données (`.data-table`)
* **Conteneur (`.table-container`)** : Bords arrondis (`14px`), sans bordure extérieure, ombre douce (`--shadow-sm`).
* **En-têtes (`th`)** : Fond gris-blanc (`#F9FAFB`), texte gras en bleu marine (`--primary`), séparateur horizontal fin.
* **Lignes (`tr`)** : Légère couleur de fond au survol pour améliorer la lisibilité.

### E. Section Déroulante de Bilan (`.collapsible-header` / `.collapsible-body`)
Utilisée dans l'affichage des rapports ou bilans d'exercice.
* **En-tête** : Fond sombre (`--primary`), coins arrondis (`12px`), texte blanc et gras.
* **Corps** : Fond blanc, se fixe sous l'en-tête de manière fluide sans bordures visibles, avec une ombre légère pour simuler l'élévation.

### F. Fenêtres Modales (`.modal-overlay` / `.modal-content`)
* **Arrière-plan (`.modal-overlay`)** : Assombrissement à `40%` avec un effet de flou d'arrière-plan (`backdrop-filter: blur(2px)`).
* **Contenu (`.modal-content`)** : Coins arrondis de `16px`, fond blanc, animation d'apparition en glissement vers le haut (`slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 4. Règles de Design Importantes

> [!IMPORTANT]
> **Pas de bordures épaisses ou colorées** : Pour maintenir l'esthétique premium de l'application, n'utilisez pas de styles de bordures agressifs. Les ombres (`--shadow-sm` à `--shadow-xl`) et les contrastes de fonds doivent être la méthode principale pour séparer visuellement les cartes et les blocs.

> [!TIP]
> **Animations et Transitions** : Toutes les interactions (boutons, lignes de tableaux, toggles, cartes, modales) possèdent une transition (`transition: all 0.2s ease` ou similaire) afin d'assurer une expérience utilisateur fluide et dynamique.
