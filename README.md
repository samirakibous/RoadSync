# RoadSync 🚛

Application web complète de gestion de flotte de camions construite avec la stack MERN (MongoDB, Express, React, Node.js). Solution professionnelle pour le suivi des trajets, la gestion du carburant, le monitoring du kilométrage et la maintenance préventive automatisée.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Technologies utilisées](#️-technologies-utilisées)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Tests](#-tests)
- [Docker](#-docker)
- [Contributeurs](#-contributeurs)

## 🎯 Aperçu

RoadSync est une solution complète pour les entreprises de transport qui permet de :
- Gérer une flotte de camions, remorques et pneus
- Suivre les trajets en temps réel avec géolocalisation
- Monitorer la consommation de carburant avec upload de factures
- Automatiser la maintenance préventive
- Recevoir des notifications intelligentes
- Générer des rapports PDF d'ordres de mission

### Rôles utilisateurs
- **Admin** : Accès complet à toutes les fonctionnalités
- **Manager** : Gestion de la flotte et création de trajets
- **Driver** : Dashboard simplifié pour gérer leurs trajets assignés

## ✨ Fonctionnalités principales

### 🔐 Authentification & Sécurité
- Authentification JWT avec refresh tokens
- Multi-rôles (Admin, Manager, Driver)
- Changement de mot de passe obligatoire pour les nouveaux comptes
- Validation des données avec Yup
- Protection CORS et hachage bcrypt

### 🚚 Gestion de la Flotte

#### Camions ([TrucksPage.jsx](frontend/src/pages/TrucksPage.jsx))
- CRUD complet
- Suivi kilométrage en temps réel
- Statuts : disponible, en mission, en maintenance, hors service
- Historique complet des maintenances

#### Remorques ([TrailersPage.jsx](frontend/src/pages/TrailersPage.jsx))
- Gestion complète avec charge maximale
- Tracking de disponibilité
- Association aux trajets

#### Pneus ([PneusPage.jsx](frontend/src/pages/PneusPage.jsx))
- Suivi de l'usure (0-100%)
- 4 positions : avant gauche/droite, arrière gauche/droite
- Attachement aux camions/remorques
- Alertes d'usure critique

### 🗺️ Gestion des Trajets

#### Pour les Managers ([TripsPage.jsx](frontend/src/pages/TripsPage.jsx))
- Création de trajets avec affectation complète
- Types : livraison, transport, autres
- Statuts : à-faire, en-cours, terminé
- Génération automatique d'ordres de mission PDF

#### Pour les Chauffeurs ([DriverDashboard.jsx](frontend/src/pages/DriverDashboard.jsx))
- **Démarrage de trajet** :
  - Récupération automatique du kilométrage du camion
  - Niveau de carburant de départ
  - Remarques sur l'état du véhicule
  
- **Pendant le trajet** :
  - Ajout de fuel logs avec upload de factures
  - Suivi en temps réel
  
- **Fin de trajet** :
  - Kilométrage d'arrivée
  - Niveau de carburant final
  - Remarques finales
  - Calcul automatique de consommation

### ⛽ Gestion du Carburant

#### Fuel Logs ([FuelLogsPage.jsx](frontend/src/pages/FuelLogsPage.jsx))
- Enregistrement des montants
- **Upload de factures** (images JPEG/PNG ou PDF) via [multer.js](backend/config/multer.js)
- Visualisation intégrée des factures
- Association aux trajets
- Statistiques de consommation

### 🔧 Maintenance Préventive Automatisée

#### Règles de Maintenance ([MaintenanceRulesPage.jsx](frontend/src/pages/MaintenanceRulesPage.jsx))
- **Création de règles automatiques** :
  - Par intervalle kilométrique (ex: tous les 10 000 km)
  - Par intervalle temporel (ex: tous les 90 jours)
- **Types d'actions** :
  - Vidange
  - Révision
  - Changement de pneu
  - Contrôle de sécurité
  - Autre
- **Applicable à** : camions, remorques, pneus

#### Maintenances ([MaintenancePage.jsx](frontend/src/pages/MaintenancePage.jsx))
- Création manuelle ou automatique
- Types : préventive, corrective, prédictive
- Statuts : planifiée, en-cours, terminée, annulée
- Capture du kilométrage au moment de la maintenance
- Notes et observations détaillées

#### Scheduler Automatique ([maintenanceScheduler.js](backend/scheduler/maintenanceScheduler.js))
- Vérification quotidienne (cron job)
- Création automatique des maintenances dues
- Notifications push pour alertes

### 🔔 Système de Notifications

#### Composant Cloche ([NotificationBell.jsx](frontend/src/components/NotificationBell.jsx))
- Notifications en temps réel
- Badge de compteur non lues
- Types d'alertes :
  - Maintenances créées
  - Maintenances à venir
  - Événements critiques
- Marquage individuel ou global comme lu
- Système d'événements via [notificationEmitter.js](backend/events/notificationEmitter.js)

### 👥 Gestion des Utilisateurs ([UsersPage.jsx](frontend/src/pages/UsersPage.jsx))
- Création de comptes chauffeurs
- Génération automatique de mot de passe temporaire
- Envoi d'email de bienvenue via Nodemailer
- Gestion des rôles et permissions

### 📄 Génération de Documents
- **Ordres de mission PDF** avec PDFKit ([Trip.controller.js](backend/controllers/Trip.controller.js))
- Includes: détails du trajet, véhicules, chauffeur, relevés kilométriques
- Téléchargement direct depuis le dashboard

## 🛠️ Technologies utilisées

### Frontend
| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 18.3.1 | Library UI |
| **Vite** | 6.0.1 | Build tool & dev server |
| **Redux Toolkit** | 2.5.0 | State management |
| **React Router** | 7.1.1 | Routing |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Lucide React** | 0.469.0 | Icons |

**Configuration** :
- [vite.config.js](frontend/vite.config.js) - Vite + React + Tailwind
- [eslint.config.js](frontend/eslint.config.js) - Linting

### Backend
| Technologie | Version | Usage |
|------------|---------|-------|
| **Node.js** | ≥18 | Runtime |
| **Express.js** | 4.21.2 | Web framework |
| **MongoDB** | - | Database NoSQL |
| **Mongoose** | 8.9.3 | ODM |
| **JWT** | 9.0.2 | Authentication |
| **bcrypt** | 5.1.1 | Password hashing |
| **Yup** | 1.4.0 | Validation |
| **Multer** | 1.4.5-lts.1 | File upload |
| **PDFKit** | 0.15.1 | PDF generation |
| **Nodemailer** | 6.9.16 | Email sending |
| **node-cron** | 3.0.3 | Scheduled tasks |

**Configuration** :
- [server.js](backend/server.js) - Entry point
- [db.js](backend/config/db.js) - MongoDB connection
- [babel.config.js](backend/babel.config.js) - Transpilation

### Tests
- **Jest** | 29.7.0 | Unit testing
- **Supertest** | 7.0.0 | API testing

Fichiers de tests dans [backend/tests](backend/tests)

### DevOps
- **Docker** & **Docker Compose** - Containerisation
- **Nginx** (optionnel) - Reverse proxy
- Health checks & monitoring

## 📁 Architecture du projet

```
RoadSync/
├── backend/
│   ├── config/           # Configuration (DB, Multer)
│   ├── controllers/      # Logique métier
│   ├── events/           # Event emitters (notifications)
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/           # Schémas Mongoose
│   ├── routes/           # Routes Express
│   ├── scheduler/        # Cron jobs (maintenance auto)
│   ├── services/         # Business logic layer
│   ├── tests/            # Tests unitaires Jest
│   ├── utils/            # Helpers (email, etc.)
│   ├── validations/      # Schémas Yup
│   ├── public/uploads/   # Fichiers uploadés
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── features/     # Redux slices
│   │   ├── pages/        # Pages principales
│   │   ├── App.jsx       # Composant racine
│   │   └── main.jsx      # Entry point
│   ├── public/           # Assets statiques
│   └── vite.config.js    # Config Vite
│
└── docker-compose.yml    # Orchestration containers
```

## 🚀 Installation

### Prérequis
- **Node.js** ≥18
- **MongoDB** ≥7.0 (local ou Atlas)
- **npm** ou **yarn**
- **Docker** (optionnel)

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/RoadSync.git
cd RoadSync
```

2. **Installer les dépendances Backend**
```bash
cd backend
npm install
```

3. **Installer les dépendances Frontend**
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend

Créez un fichier `.env` dans le dossier `backend` :

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/roadsync

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_EXPIRES_IN=7d

# Email (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre.email@gmail.com
MAIL_PASS=votre_mot_de_passe_app
```

**Note** : Pour Gmail, activez l'authentification 2FA et générez un "mot de passe d'application".

### Frontend

Les URLs d'API sont configurées dans les slices Redux. Par défaut : `http://localhost:3000`

Pour changer l'URL en production, modifier dans chaque slice :
```javascript
const res = await fetch("http://votre-backend.com/api/...", ...)
```

## 💻 Utilisation

### Développement local

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
# Serveur sur http://localhost:3000
```

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
# Interface sur http://localhost:5173
```

### Build de production

**Backend** :
```bash
cd backend
npm start
```

**Frontend** :
```bash
cd frontend
npm run build
npm run preview
```

### Commandes utiles

**Backend** :
- `npm run dev` - Mode développement avec nodemon
- `npm test` - Tests unitaires Jest
- `npm run test:watch` - Tests en mode watch
- `npm run test:coverage` - Rapport de couverture

**Frontend** :
- `npm run dev` - Serveur de développement Vite
- `npm run build` - Build de production
- `npm run preview` - Preview du build
- `npm run lint` - Linting ESLint

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints principaux

#### Authentication
```http
POST /auth/login           # Connexion
POST /auth/change-password # Changement de mot de passe
```

#### Trucks
```http
GET    /trucks             # Liste des camions
POST   /trucks             # Créer un camion
GET    /trucks/:id         # Détails d'un camion
PUT    /trucks/:id         # Modifier un camion
DELETE /trucks/:id         # Supprimer un camion
```

#### Trips
```http
GET    /trips             # Liste des trajets
POST   /trips             # Créer un trajet
GET    /trips/:id         # Détails d'un trajet
PUT    /trips/:id         # Modifier un trajet
DELETE /trips/:id         # Supprimer un trajet
PATCH  /trips/:id/start   # Démarrer un trajet
PATCH  /trips/:id/end     # Terminer un trajet
GET    /trips/:id/pdf     # Télécharger l'ordre de mission PDF
```

#### Maintenance
```http
GET    /maintenance            # Liste des maintenances
POST   /maintenance            # Créer une maintenance
GET    /maintenance/:id        # Détails d'une maintenance
PUT    /maintenance/:id        # Modifier une maintenance
DELETE /maintenance/:id        # Supprimer une maintenance
PATCH  /maintenance/:id/complete # Marquer comme terminée
```

#### Fuel Logs
```http
GET    /fuelLog            # Liste des fuel logs
POST   /fuelLog            # Créer un fuel log (+ upload facture)
GET    /fuelLog/:id        # Détails d'un fuel log
DELETE /fuelLog/:id        # Supprimer un fuel log
```

#### Notifications
```http
GET    /notifications/my-notifications  # Mes notifications
PATCH  /notifications/:id/read          # Marquer comme lue
PATCH  /notifications/mark-all-read     # Tout marquer comme lu
```

### Authentification

Toutes les routes (sauf `/auth/login`) nécessitent un token JWT :

```http
Authorization: Bearer <votre_token_jwt>
```

### Upload de fichiers

Pour les factures de carburant, utiliser `multipart/form-data` :

```javascript
const formData = new FormData();
formData.append('montant', 150);
formData.append('factureType', 'pdf');
formData.append('facture', file); // File object
```

Voir la configuration Multer dans [multer.js](backend/config/multer.js).

## 🧪 Tests

### Lancer les tests

**Tous les tests** :
```bash
cd backend
npm test
```

**Tests spécifiques** :
```bash
npm test trip.controller.test.js
npm test maintenance.service.test.js
```

**Couverture** :
```bash
npm run test:coverage
```

### Tests disponibles

- [trip.controller.test.js](backend/tests/trip.controller.test.js) - Tests des trajets
- [maintenance.controller.test.js](backend/tests/maintenance.controller.test.js) - Tests maintenances
- [maintenance.service.test.js](backend/tests/maintenance.service.test.js) - Tests services
- [pneu.controller.test.js](backend/tests/pneu.controller.test.js) - Tests pneus

Configuration : [jest.config.js](backend/jest.config.js)

## 🐳 Docker

### Démarrage avec Docker Compose

Le projet inclut une configuration Docker complète ([docker-compose.yml](docker-compose.yml)) :

**Services** :
- `mongodb` - Base de données MongoDB 7.0
- `backend` - API Node.js/Express
- `frontend` - Application React/Vite

**Lancer tous les services** :
```bash
docker-compose up -d
```

**Arrêter les services** :
```bash
docker-compose down
```

**Voir les logs** :
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Dockerfiles

- **Backend** : [Dockerfile](backend/Dockerfile)
  - Image : `node:22-alpine`
  - Production-ready avec `npm ci --only=production`
  - Health check sur `/api/health`

- **Frontend** : [Dockerfile](frontend/Dockerfile)
  - Image : `node:22-alpine`
  - Dev server Vite avec HMR
  - Exposé sur port 5173

### Volumes

Les données MongoDB et les uploads sont persistés :
```yaml
volumes:
  - mongodb_data:/data/db
  - ./backend/public/uploads:/app/public/uploads
```

### Accès aux services

Une fois démarrés :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **MongoDB** : localhost:27017

## 👥 Contributeurs

- **Votre Nom** - Développeur principal

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

**RoadSync** - Simplifiez la gestion de votre flotte de transport 🚚

Pour toute question ou support : [votre.email@example.com](mailto:votre.email@example.com)