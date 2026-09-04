# Structure de SWAY Phone

`index.html` est volontairement court : il contient uniquement la structure de la page et charge les fichiers ci-dessous.

- `css/app.css` : couleurs, mise en page et design.
- `js/core.js` : données, connexion, sauvegarde, tableau de bord et sorties.
- `js/operations.js` : commandes, réceptions et fournisseurs.
- `js/scanner.js` : scanner de bons, contrôle et administration.
- `js/catalogue.js` : produits, fiches techniques, inventaire et bilan.
- `js/interface.js` : navigation, réglages, prévisions, historique et démarrage de l’application.
- `assets/` : logos et images.
- `supabase/migrations/` : évolution versionnée de la base de données partagée. La première migration crée le socle sécurisé multi-établissements, les rôles et le journal d'audit.

Les fichiers JavaScript sont chargés dans cet ordre. Ne déplace pas une fonction d’un fichier à un autre sans vérifier les écrans concernés.
# Sway Phone

## Connexion sécurisée

La connexion e-mail / mot de passe utilise Supabase Auth. Les clés privilégiées ne figurent pas dans cette application : seul l’identifiant public du projet est chargé par le navigateur et les règles RLS de Supabase contrôlent les données.

Après inscription, l’utilisateur confirme son adresse e-mail puis crée son premier espace et établissement. Les données métier restent encore locales dans cette étape ; leur synchronisation Phone/Desktop est la prochaine migration fonctionnelle.
