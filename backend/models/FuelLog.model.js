import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    montant: Number,
    factureUrl: { type: String },
    factureType: { type: String, enum: ['image', 'pdf'] }
}, { timestamps: true });

export default mongoose.model('FuelLog', fuelLogSchema);