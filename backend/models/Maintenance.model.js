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
    refPath: 'resourceModel' 
}, //dynamic ref
  rule: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MaintenanceRule' 
  },
  notes: { type: String },
  
  kmAtMaintenance: { type: Number, min: 0 },
    status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  completedAt: { type: Date },
}, {
  timestamps: true
});

maintenanceSchema.virtual('resourceModel').get(function() {
  const typeMap = {
    'truck': 'Truck',
    'trailer': 'Trailer',
    'pneu': 'Pneu'
  };
  return typeMap[this.resourceType];
});

export default mongoose.model('Maintenance', maintenanceSchema);
