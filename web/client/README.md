# Système de Réservation

Ce projet est un système de réservation en ligne permettant de prendre des rendez-vous avec des professionnels (coiffeurs, médecins, etc.).

## Technologies utilisées

### Frontend

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- React Datepicker

### Backend

- Node.js
- Express
- TypeScript
- MongoDB avec Mongoose

## Configuration du projet

### Prérequis

- Node.js et npm installés
- MongoDB installé et en cours d'exécution (ou utiliser MongoDB Atlas)

### Installation

1. Cloner le projet

```
git clone <url-du-projet>
cd <nom-du-projet>
```

2. Installer les dépendances du frontend

```
cd client
npm install
```

3. Installer les dépendances du backend

```
cd ../server
npm install
```

4. Configurer les variables d'environnement
   - Créer un fichier `.env` dans le dossier `server` basé sur `.env.example`

### Démarrage

1. Démarrer le backend

```
cd server
npm run dev
```

2. Démarrer le frontend

```
cd client
npm start
```

## Fonctionnalités

- 🔐 Authentification des utilisateurs
- 👥 Gestion des profils (clients, professionnels)
- 📅 Réservation de rendez-vous
- 🔍 Recherche par service et professionnel
- 📱 Interface responsive
- 📧 Notifications et rappels (à implémenter)

## Structure du projet

### Frontend

```
client/
├── public/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services pour les appels API (à implémenter)
│   ├── context/          # Contextes React (à implémenter)
│   ├── types/            # Types TypeScript (à implémenter)
│   ├── App.tsx           # Composant principal
│   └── index.tsx         # Point d'entrée
```

### Backend

```
server/
├── src/
│   ├── controllers/      # Contrôleurs pour les routes
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Routes Express
│   ├── middleware/       # Middleware (auth, validation, etc.)
│   ├── config/           # Configuration
│   └── index.ts          # Point d'entrée
```

## Améliorations futures

- Système de notifications par email
- Intégration de paiement
- Système d'avis et de notation
- Calendrier interactif avancé
- Application mobile (React Native)
