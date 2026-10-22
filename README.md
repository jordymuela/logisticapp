# Corridor RDC — démo

Prototype mobile (Expo / React Native) d’une plateforme logistique pour les corridors de la RDC :
expéditeurs qui déclarent des chargements, propriétaires de camions vérifiés (AFEGEME, DGM, assurance),
revue de conformité par un administrateur, et suivi de la mission jusqu’à la livraison.

Les données sont fictives et vivent en mémoire : rien n’est envoyé à un serveur.

## Lancer la démo sur un téléphone (Expo Go)

1. Installer **Expo Go** sur le téléphone (App Store / Play Store).
2. Sur un ordinateur connecté au même Wi-Fi :

```bash
npm install
npx expo start
```

3. Scanner le QR code affiché dans le terminal avec l’appareil photo (iOS) ou depuis Expo Go (Android).

Si le téléphone et l’ordinateur ne sont pas sur le même réseau : `npx expo start --tunnel`.

## Parcours de démonstration

Sur l’écran d’accueil, choisir un rôle. On peut changer de rôle à tout moment depuis l’onglet
Entreprise / Mon camion / Tableau de bord.

1. **Expéditeur (TransOrnelas)** : onglet *Déclarer*, choisir Matadi → Lubumbashi, remplir la
   cargaison. Le devis se calcule seul : prix camion + supplément de gestion (170 USD) + prime
   d’assurance (0,8 % de la valeur). Soumettre.
2. **Administrateur** : onglet *Validation*, ouvrir le chargement, *Valider et publier*. Ouvrir
   « Ets Mbuyi Logistique », vérifier les documents, approuver le transporteur.
3. **Transporteur (Transports Kalonji)** : onglet *Missions*, ouvrir un chargement disponible,
   *Accepter la mission*, puis *Démarrer le transport* et *Confirmer la livraison*.
4. **Transporteur** : onglet *Mon camion* → *Inscrire un autre camion* pour voir le formulaire
   d’inscription avec téléversement des documents (photo ou galerie).
5. **Administrateur** : onglet *Tableau de bord* pour les flux financiers et la projection
   300 / 500 chargements par mois.

## Développement

```bash
npx tsc --noEmit   # typage
npx expo lint      # lint
```

Structure : `src/app` (routes Expo Router), `src/components` (UI), `src/domain` (types, tarification,
données de démo), `src/store` (état en mémoire), `src/utils` (formatage, sélection de documents).
