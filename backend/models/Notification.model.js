import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type de notification (catégorie)
    type: {
      type: String,
      enum: ["maintenance_due", "maintenance_created", "alert"],
      required: true,
    },

    // Message affiché à l’utilisateur
    message: {
      type: String,
      required: true,
    },

    // Lien vers une maintenance (si c'est lié)
    maintenance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maintenance",
      default: null,
    },

    // Est-ce que l'utilisateur l'a lue ?
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
