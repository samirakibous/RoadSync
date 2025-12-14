import mongoose from 'mongoose';

const pneuSchema = new mongoose.Schema(
  {
    position: {
      type: String, 
      enum: ["avant gauche", "avant droite", "arriere gauche", "arriere droite"],
      required: true
    },
    usurePourcentage: { type: Number, default: 0 },

    truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: "Trailer" },
    status : {
      type: String, 
      enum: ["disponible", "en_mission", "en_maintenance", "hors_service"],
      default: "disponible"
    },
    marque: { type: String, required: true },
    lastMaintenance: { type: Date },

    dateInstallation: Date
  },
  { timestamps: true }
);

pneuSchema.pre("save", async function() {
  if (this.truck && this.trailer) {
    throw new Error("Un pneu ne peut pas être attaché à la fois à un camion et à une remorque.");
  }
  
  // Gérer le statut du véhicule associé
  const Truck = mongoose.model('Truck');
  const Trailer = mongoose.model('Trailer');
  
  if (this.isModified('status')) {
    if (this.status === 'en_maintenance' || this.status === 'hors_service') {
      // Si le pneu est en maintenance ou hors service, mettre le véhicule en hors_service
      if (this.truck) {
        await Truck.findByIdAndUpdate(this.truck, { status: 'hors_service' });
      }
      if (this.trailer) {
        await Trailer.findByIdAndUpdate(this.trailer, { status: 'hors_service' });
      }
    } else if (this.status === 'disponible') {
      // Si le pneu devient disponible, vérifier si tous les autres pneus du véhicule sont aussi disponibles
      if (this.truck) {
        const otherPneus = await this.constructor.find({ 
          truck: this.truck, 
          _id: { $ne: this._id },
          status: { $in: ['en_maintenance', 'hors_service'] }
        });
        
        if (otherPneus.length === 0) {
          await Truck.findByIdAndUpdate(this.truck, { status: 'disponible' });
        }
      }
      if (this.trailer) {
        const otherPneus = await this.constructor.find({ 
          trailer: this.trailer, 
          _id: { $ne: this._id },
          status: { $in: ['en_maintenance', 'hors_service'] }
        });
        
        if (otherPneus.length === 0) {
          await Trailer.findByIdAndUpdate(this.trailer, { status: 'disponible' });
        }
      }
    }
  }
});


export default mongoose.model("Pneu", pneuSchema);
