import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  resourceType: { 
    type: String, 
    enum: ['truck', 'trailer', 'pneu'], 
    required: true 
  },
  resource: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'resourceType' 
  }, // référence dynamique au modèle correspondant
  rule: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MaintenanceRule' 
  }, // règle appliquée, si applicable
  notes: { type: String },
  
  kmAtMaintenance: { type: Number, min: 0 },
}, {
  timestamps: true
});

export default mongoose.model('Maintenance', maintenanceSchema);
