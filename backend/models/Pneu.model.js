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
});


export default mongoose.model("Pneu", pneuSchema);
