# Booked - Application Mobile

Version mobile de l'application Booked développée avec React Native, Expo et NativeWind.

## Fonctionnalités

- Authentification (connexion, inscription)
- Navigation par onglets
- Interface utilisateur adaptée aux appareils mobiles
- Communication avec l'API back-end
- Gestion des réservations

## Technologies utilisées

- React Native
- Expo
- TypeScript
- NativeWind (Tailwind CSS pour React Native)
- React Navigation
- Axios pour les requêtes HTTP
- AsyncStorage pour le stockage local

## Structure du projet

```
mobile/
├── assets/               # Images, icônes, etc.
├── src/
│   ├── components/       # Composants réutilisables
│   ├── contexts/         # Contextes React (AuthContext, etc.)
│   ├── navigation/       # Configuration de la navigation
│   ├── screens/          # Écrans de l'application
│   ├── services/         # Services API, utilitaires
│   ├── types/            # Définitions TypeScript
│   ├── utils/            # Fonctions utilitaires
│   └── constants/        # Constantes de l'application
├── App.tsx               # Point d'entrée de l'application
└── package.json          # Dépendances du projet
```

## Installation et démarrage

1. Assurez-vous d'avoir Node.js installé
2. Installez les dépendances à la **racine du projet** et dans le dossier **server**:
   ```bash
   npm install
   ```
3. Assurez vous de bien modifier le .env à la racine pour que l'IP corresponde bien à votre adresse IPV4 actuelle
4. Démarrez le serveur dans le dossier server
   ```bash
   node ./server.js
   ```
5. Démarrez l'application à la racine:
   ```bash
   npx expo start --clear
   ```
6. Utilisez l'application Expo Go sur votre appareil mobile ou un émulateur pour exécuter l'application

## Développement

Pour ajouter de nouveaux écrans ou fonctionnalités, suivez la structure de fichiers existante et utilisez les composants réutilisables dans le dossier `components`.

## Connexion au backend

L'application se connecte au backend via l'API configurée dans `src/services/api.ts`. Assurez-vous que l'URL de l'API est correctement configurée pour votre environnement de développement.

## Notes

Cette application est en cours de développement et toutes les fonctionnalités ne sont pas encore implémentées.
