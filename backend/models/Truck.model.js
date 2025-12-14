import mongoose from 'mongoose';

const TruckSchema = new mongoose.Schema({
  immatriculation: { type: String, required: true, unique: true },
  modele: { type: String, required: true },
  kilometrage: { type: Number, default: 0 },
  status: {  // ✅ Changé de 'statut' à 'status'
    type: String, 
    enum: ['disponible', 'en_mission', 'en_maintenance', 'hors_service'], 
    default: 'disponible' 
  },
  dateAchat: { type: Date, required: true },
  derniereMaintenance: { type: Date },
}, {
  timestamps: true
});

export default mongoose.model('Truck', TruckSchema);
