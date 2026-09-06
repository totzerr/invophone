# SWAY Phone — structure du code

`index.html` contient uniquement le squelette de la page et un point d’entrée. Il reste sous 50 lignes.

## Démarrage

- `js/bootstrap.js` charge tous les modules dans le bon ordre.
- `css/sway.css` charge les styles dans le bon ordre.

## JavaScript

- `js/foundation/` : stockage local, traductions, données de départ, rôles et règles communes.
- `js/auth/` : comptes, session et connexion Supabase.
- `js/workspace/` : sauvegarde, restauration, import depuis un ancien logiciel.
- `js/stock/` : catalogue matière et mouvements de stock.
- `js/orders/` : commandes, fournisseurs et réceptions.
- `js/inventory/` : emplacements et comptage d’inventaire.
- `js/catalogue/` : fiches techniques et recettes.
- `js/sales/` : caisse et déclaration de sorties.
- `js/dashboard/` et `js/analytics/` : vue générale et analyses.
- `js/administration/` : documents, factures, contrats et suivi administratif.
- `js/scanner/` : préparation d’image, OCR, contrôle humain et validation.
- `js/interface/` : navigation, réglages, alertes et démarrage de l’application.

## Styles

Les styles suivent la même organisation : fondations, connexion, navigation, scanner, composants, écrans métier, réglages et adaptations téléphone/ordinateur. Ne pas ajouter de règles dans un fichier « fourre-tout » : la règle va dans le dossier de l’écran ou du composant concerné.

## Données partagées

- `assets/` : logos et ressources visuelles.
- `supabase/migrations/` : évolutions versionnées de la base de données.
- `tests/` : contrôles de syntaxe, architecture et règles métier.

La connexion e-mail / mot de passe utilise Supabase Auth. Les clés privilégiées ne sont jamais dans le navigateur ; seules les clés publiques et les règles RLS sont utilisées côté application.
