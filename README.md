# DailyQuizz

> Application mobile de **quiz quotidien** : un nouveau quiz chaque jour, des scores, un classement et un système d'amis. Développée avec React Native / Expo.

> 🔗 Démo : _à venir_ (build Expo / stores)

---

## Fonctionnalités

- **Quiz du jour** — un quiz renouvelé quotidiennement, avec révélation des bonnes réponses en fin de partie.
- **Score & résultats** — calcul du score et écran de récapitulatif des réponses.
- **Classement** — leaderboard des joueurs.
- **Amis** — ajout et suivi d'amis.
- **Authentification** — inscription, connexion, vérification d'e-mail par lien et réinitialisation de mot de passe (Supabase Auth).
- **Règles** — écran expliquant le fonctionnement du jeu.
- **Expérience soignée** — retours haptiques, effets de flou, police Orbitron pour une ambiance « arcade ».

## Stack technique

| Domaine | Technologies |
|---|---|
| Framework | Expo 53, React Native 0.79, React 19, TypeScript |
| Navigation | Expo Router (routing par fichiers) |
| Back-end / données | Supabase (Auth, PostgreSQL) |
| Stockage local | AsyncStorage |
| UI / UX | expo-blur, expo-haptics, expo-image, @expo-google-fonts/orbitron |
| Build | EAS Build |

## Prérequis

- Node.js 20+
- [Expo CLI](https://docs.expo.dev/) (`npx expo`)
- Un projet [Supabase](https://supabase.com)
- L'application [Expo Go](https://expo.dev/go) ou un émulateur Android / simulateur iOS

## Installation

```bash
git clone https://github.com/ZOoMaaaaa/dailyquizz3.git
cd dailyquizz3
npm install
```

Crée un fichier `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## Lancer l'application

```bash
npm start          # serveur de dev Expo (QR code)
npm run android    # émulateur / appareil Android
npm run ios        # simulateur iOS
npm run web        # version web
```

## Structure du projet

```
app/
  index.tsx            Accueil
  auth.tsx             Connexion
  enregistrement.tsx   Inscription
  dailyquizz.tsx       Quiz du jour
  answers.tsx          Réponses
  score.tsx            Résultat
  ranklist.tsx         Classement
  amis.tsx             Amis
  regles.tsx           Règles
  reset-password.tsx   Réinitialisation du mot de passe
  verify/[token].tsx   Vérification d'e-mail
lib/                   Client Supabase & helpers
providers/             Contextes React
assets/                Polices et images
```

## Build de production

Le projet est configuré pour [EAS Build](https://docs.expo.dev/build/introduction/) (`eas.json`) :

```bash
eas build --platform android
eas build --platform ios
```

## Licence

Projet personnel — tous droits réservés.
