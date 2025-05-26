# Cahier des Charges - Booked

## 1. Contexte et Description

Booked est une application SaaS (Software as a Service) destinée aux petits professionnels tels que les salons de coiffure, les instituts de beauté, et autres prestataires de services nécessitant un système de réservation. L'objectif principal est de simplifier la gestion des rendez-vous via une application web accessible et intuitive ainsi qu'une application mobile.

L'application permettra à ces professionnels de digitaliser leur système de réservation, d'améliorer l'expérience client et d'optimiser la gestion de leur planning au quotidien.

## 2. Fonctionnalités

### Fonctionnalités pour les professionnels (Business Owners)

- **Gestion de compte professionnel**

  - Création et personnalisation du profil entreprise
  - Paramétrage des horaires d'ouverture
  - Configuration des services proposés et leurs durées
  - Définition des tarifs

- **Gestion du calendrier**

  - Visualisation des réservations (vue journalière, hebdomadaire, mensuelle)
  - Blocage de créneaux pour indisponibilités
  - Gestion des congés et jours fériés

- **Gestion des réservations**

  - Acceptation/refus manuel ou automatique des demandes
  - Modification/annulation de rendez-vous
  - Envoi de notifications aux clients

- **Gestion des clients**

  - Base de données clients avec historique
  - Notes et préférences par client
  - Statistiques et historique de fréquentation

- **Tableau de bord analytique**
  - Suivi de l'activité et du taux d'occupation
  - Statistiques de réservation
  - Rapports périodiques

### Fonctionnalités pour les clients

- **Gestion de compte client**

  - Création et gestion de profil
  - Historique des rendez-vous
  - Notifications et rappels

- **Réservation en ligne**

  - Recherche par type de service
  - Sélection de date et d'heure disponibles
  - Choix du prestataire (si applicable)
  - Paiement en ligne (optionnel)

- **Gestion des rendez-vous**
  - Modification de réservation
  - Annulation de rendez-vous
  - Rappels automatiques

## 3. Choix des Technologies

### Frontend

- **Framework** : React avec TypeScript
- **Routage** : React Router
- **Styles** : TailwindCSS pour le design responsive
- **Interface utilisateur** : Composants personnalisés avec Material UI
- **Gestion des dates** : date-fns, react-datepicker
- **Requêtes API** : Axios
- **Icônes** : React Icons

### Backend

- **Framework** : Node.js avec Express
- **Langage** : TypeScript
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT (JSON Web Token)
- **Sécurité** : bcrypt pour le hachage des mots de passe
- **Communication par email** : Nodemailer
- **Gestion des fichiers** : Multer pour les uploads
- **Variables d'environnement** : dotenv

### Infrastructure

- **Déploiement** : À définir (options: Vercel, Heroku, AWS, etc.)
- **CI/CD** : À définir
- **Stockage des médias** : Solution locale avec possibilité de migration vers un service cloud

## 4. Mise en Place de l'Environnement de Développement

### Prérequis

- Node.js (version LTS recommandée)
- npm ou yarn
- MongoDB installé localement ou accès à une instance MongoDB (Atlas)
- Un éditeur de code (VS Code recommandé)
- Git

### Installation

1. **Cloner le dépôt**

   ```
   git clone <URL_du_dépôt>
   cd Booked
   ```

2. **Installation des dépendances**

   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Configuration des variables d'environnement**

   - Créer un fichier `.env` dans le dossier `server` en s'inspirant du modèle `.env.example`
   - Configurer les variables nécessaires (connexion MongoDB, clés JWT, etc.)

4. **Initialisation de la base de données**

   ```
   cd server
   npm run init-db
   ```

5. **Lancement de l'application en développement**
   ```
   # À la racine du projet
   npm run dev
   ```
   Cette commande lancera simultanément le serveur backend et l'application frontend.

### Scripts disponibles

- `npm run dev` : Démarre l'application en mode développement
- `npm run dev:client` : Démarre uniquement le frontend
- `npm run dev:server` : Démarre uniquement le backend
- `npm run build` : Compile l'application pour la production
- `npm run init-db` : Initialise la base de données avec les données de base
- `npm run seed-real-data` : Ajoute des données de test réalistes

### Conventions de code

- Utiliser ESLint et Prettier pour maintenir un style de code cohérent
- Suivre les principes de la programmation fonctionnelle et des composants React
- Documenter les API avec des commentaires clairs
- Respecter une architecture modulaire pour faciliter la maintenance
