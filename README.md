# Corridor RDC — démo

Prototype mobile (Expo / React Native) d’une plateforme logistique pour les corridors de la RDC :
expéditeurs qui déclarent des chargements, propriétaires de camions vérifiés (AFEGEME, DGM, assurance),
revue de conformité par un administrateur, et suivi de la mission jusqu’à la livraison.

Interface en **français** et **portugais** (bouton FR / PT sur l’écran d’accueil et dans les onglets
Entreprise / Mon camion / Tableau de bord).

Les données sont partagées en temps réel via **Supabase** : un chargement déclaré sur un téléphone
apparaît immédiatement sur le téléphone de l’administrateur. Sans variables d’environnement, l’app
fonctionne en mode local avec des données fictives.

## Lancer la démo sur un téléphone (Expo Go)

1. Installer **Expo Go** sur le téléphone (App Store / Play Store).
2. Sur un ordinateur connecté au même Wi-Fi :

```bash
npm install
npx expo start
```

3. Scanner le QR code affiché dans le terminal avec l’appareil photo (iOS) ou depuis Expo Go (Android).

Si le téléphone et l’ordinateur ne sont pas sur le même réseau : `npx expo start --tunnel`.

### Simulateur iPhone (Mac avec Xcode)

```bash
npx expo start --ios
```

ou `npx expo start` puis la touche `i`. Xcode et un simulateur iOS doivent être installés.

## Backend Supabase

Le fichier `.env` contient l’URL du projet et la clé **publishable** (publique par conception).
Schéma : tables `loads` et `carriers`, bucket de stockage `documents` pour les photos des
documents, Realtime activé sur les deux tables.

Au premier lancement, si les tables sont vides, l’app y insère les données de démonstration.
« Réinitialiser la démo » efface et réinsère ces données pour tous les appareils.

**Les règles d’accès sont volontairement ouvertes (rôle anonyme en lecture/écriture) pour la
démonstration. À remplacer par une authentification et des règles par rôle avant tout usage réel.**

## Parcours de démonstration

Sur l’écran d’accueil, choisir un rôle. On peut changer de rôle à tout moment.

1. **Expéditeur (TransOrnelas)** : onglet *Déclarer*, choisir Matadi → Lubumbashi, remplir la
   cargaison. Le devis se calcule seul : prix camion + supplément de gestion (170 USD) + prime
   d’assurance (0,8 % de la valeur). Soumettre.
2. **Administrateur** : onglet *Validation*, ouvrir le chargement, *Valider et publier*. Ouvrir
   « Ets Mbuyi Logistique », vérifier les documents, approuver le transporteur.
3. **Transporteur (Transports Kalonji)** : onglet *Missions*, ouvrir un chargement disponible,
   *Accepter la mission*, puis *Démarrer le transport* et *Confirmer la livraison*.
4. **Transporteur** : onglet *Mon camion* → *Inscrire un autre camion* : formulaire d’inscription
   avec photo des documents (envoyées dans le bucket Supabase).
5. **Administrateur** : onglet *Tableau de bord* pour les flux financiers et la projection
   300 / 500 chargements par mois.

Avec deux téléphones, faire l’étape 1 sur l’un et l’étape 2 sur l’autre : la liste se met à jour seule.

## Développement

```bash
npx tsc --noEmit   # typage
npx expo lint      # lint
```

Structure : `src/app` (routes Expo Router), `src/components` (UI), `src/domain` (types, tarification,
données de démo), `src/i18n` (textes FR/PT), `src/services` (client Supabase, mapping des tables,
stockage), `src/store` (état + synchronisation), `src/utils` (formatage, sélection de documents).
