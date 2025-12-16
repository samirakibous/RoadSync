# Utiliser Node.js comme image de base
FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier tous les fichiers du backend
COPY . .

# Créer le dossier pour les uploads
RUN mkdir -p public/uploads/fuelLogs

# Exposer le port 3000
EXPOSE 3000

# Variable d'environnement par défaut
ENV NODE_ENV=production

# Commande pour démarrer l'application
CMD ["node", "server.js"]
