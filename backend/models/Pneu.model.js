const pneuSchema = new mongoose.Schema(
  {
    position: {
      type: String, 
      enum: ["avant_gauche", "avant_droite", "arriere_gauche", "arriere_droite"],
      required: true
    },
    usurePourcentage: { type: Number, default: 0 },

    camion: { type: mongoose.Schema.Types.ObjectId, ref: "Camion" },
    remorque: { type: mongoose.Schema.Types.ObjectId, ref: "Remorque" },
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

pneuSchema.pre("save", function(next) {
  if (this.camion && this.remorque) {
    return next(new Error("Un pneu ne peut pas être attaché à la fois à un camion et à une remorque."));
  }
  next();
});

export default mongoose.model("Pneu", pneuSchema);
