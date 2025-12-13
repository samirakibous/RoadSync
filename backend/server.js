import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import auth from './routes/auth.routes.js';
import users from './routes/users.routes.js';
import truck from './routes/truck.routes.js';
import trailer from './routes/trailers.routes.js';
import trip from './routes/trip.routes.js';
import pneu from './routes/pneu.routes.js';
import maintenance from './routes/maintenance.routes.js';
import rules from './routes/maintenanceRule.routes.js';
import notifications from './routes/notification.routes.js';
import fuelLog from './routes/fuelLog.routes.js';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.middleware.js';
import './events/vidangeListener.js';
import { startMaintenanceScheduler } from "./scheduler/maintenanceScheduler.js";
// import cors from 'cors';


dotenv.config();
const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }
));
app.use(express.json());

// Routes
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/trucks', truck);
app.use('/api/trailers', trailer);
app.use('/api/trips', trip);
app.use('/api/pneus', pneu);
app.use('/api/maintenance-rules', rules);
app.use('/api/maintenance', maintenance);
app.use('/api/notifications', notifications); 
app.use('/api/fuelLog', fuelLog);
app.use("/uploads/factures", express.static("uploads/factures"));

app.use(errorHandler);

// Démarrer le serveur correctement
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB(); // Connexion à la DB
    startMaintenanceScheduler(); // Scheduler après connexion
    app.listen(PORT, () => {
      console.log(`✅ Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage:", error);
    process.exit(1);
  }
};

startServer();
