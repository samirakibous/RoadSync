import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import auth from './routes/auth.routes.js';
import users from './routes/users.routes.js';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.middleware.js';

dotenv.config();
const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', auth);
app.use('/api/users',users);

app.use(errorHandler);
// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
