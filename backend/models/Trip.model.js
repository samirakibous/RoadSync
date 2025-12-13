import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    lieuDepart: { type: String, required: true },
    lieuArrivee: { type: String, required: true },

    datDepart: { type: Date, required: true },
    dateArrivee: { type: Date, required: true },

    status: {
        type: String,enum: ['a-faire', 'en-cours', 'termine'], default: 'a-faire'
    },

    carburantPrevu: { type: Number, min: 0 },
    carburantDepart: { type: Number, min: 0 },
    carburantArrivee: { type: Number, min: 0 },

    kmDepart: { type: Number, min: 0 },
    kmArrivee: { type: Number, min: 0 },

    type: {
        type: String,
        enum: ['livraison', 'transport','autres'],
        default: 'livraison'
    },
    
    poidsCargo: { type: Number, min: 0 },
    description: { type: String },
    notes: { type: String }

}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);