import mongoose from 'mongoose';

const maintenanceRuleSchema = new mongoose.Schema({
  type: {  type: String, enum: ['truck', 'trailer', 'pneu'], required: true },

  action: { type: String, enum: ['vidange', 'revision', 'changement_pneu', 'controle_securite', 'autre'], required: true }, 

  intervalKm: { type: Number, min: 0 }, //entre deux maintenances

  intervalDays: { type: Number, min: 0 }, // intervalle en jours pour la maintenance périodique

  description: { type: String },

  active: { type: Boolean, default: true },

}, {
  timestamps: true
});

export default mongoose.model('MaintenanceRule', maintenanceRuleSchema);
