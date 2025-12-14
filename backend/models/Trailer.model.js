import mongoose from 'mongoose';

const trailerSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    maxLoad: { type: Number, min: 0, required: true },

    status: {
        type: String,
        enum: ['disponible', 'en_mission', 'en_maintenance', 'hors_service'],
        default: 'disponible'
    },

    purchaseDate: { type: Date, required: true },
    lastMaintenance: { type: Date },

}, { timestamps: true });

export default mongoose.model('Trailer', trailerSchema);