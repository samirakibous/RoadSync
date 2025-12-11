import Trip from "../models/Trip.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import User from "../models/User.model.js";

export const createTrip = async (req, res, next) => {
  try {
    const {
      truck, trailer, driver,
      lieuDepart, lieuArrivee,
      datDepart, dateArrivee,
      status, carburantPrevu, carburantDepart, carburantArrivee,
      kmDepart, kmArrivee, type,
      poidsCargo, description, notes
    } = req.body;

    const truckExists = await Truck.findById(truck);
    if (!truckExists) return res.status(400).json({ success: false, message: "Camion invalide" });

    const trailerExists = await Trailer.findById(trailer);
    if (!trailerExists) return res.status(400).json({ success: false, message: "Remorque invalide" });

    const driverExists = await User.findById(driver);
    if (!driverExists || driverExists.role !== "driver") return res.status(400).json({ success: false, message: "Chauffeur invalide" });

    const trip = await Trip.create({
      truck, trailer, driver,
      lieuDepart, lieuArrivee,
      datDepart, dateArrivee,
      status, carburantPrevu, carburantDepart, carburantArrivee,
      kmDepart, kmArrivee, type,
      poidsCargo, description, notes
    });

    res.status(201).json({
      success: true,
      message: "Trajet créé avec succès",
      data: trip
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find()
      .populate("truck")
      .populate("trailer")
      .populate("driver");

    res.status(200).json({
      success: true,
      message: "Liste des trajets",
      data: trips
    });
  } catch (err) {
    next(err);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("truck")
      .populate("trailer")
      .populate("driver");

    if (!trip) return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    // Mise à jour champ par champ
    for (let key in req.body) {
      trip[key] = req.body[key];
    }

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trajet mis à jour",
      data: trip
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    res.status(200).json({
      success: true,
      message: "Trajet supprimé avec succès"
    });
  } catch (err) {
    next(err);
  }
};

export const startTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) 
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    if (trip.status !== 'a-faire') {
      return res.status(400).json({ 
        success: false, 
        message: "Le trajet a déjà été commencé ou terminé" 
      });
    }

    // Récupération des valeurs envoyées par le driver (optionnel)
    const { kmDepart, carburantDepart } = req.body;

    trip.status = "en-cours";
    trip.datDepart = new Date();
    if (kmDepart !== undefined) trip.kmDepart = kmDepart;
    if (carburantDepart !== undefined) trip.carburantDepart = carburantDepart;

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trajet commencé",
      data: trip
    });

  } catch (err) {
    next(err);
  }
};


export const endTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) 
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    if (trip.status !== "en-cours") {
      return res.status(400).json({
        success: false,
        message: "Impossible de terminer un trajet non commencé"
      });
    }

    const { kmArrivee, carburantArrivee } = req.body;

    if (kmArrivee !== undefined && kmArrivee < trip.kmDepart) {
      return res.status(400).json({
        success: false,
        message: "Le kilométrage final ne peut pas être inférieur au kilométrage initial"
      });
    }

    trip.status = "termine";
    trip.dateArrivee = new Date();
    if (kmArrivee !== undefined) trip.kmArrivee = kmArrivee;
    if (carburantArrivee !== undefined) trip.carburantArrivee = carburantArrivee;

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trajet terminé",
      data: trip
    });

  } catch (err) {
    next(err);
  }
};

export const getTripByDriver = async(req,res,next)=>{
    try{
        const driverId = req.params.id;

    const trips = await Trip.find({ driver: driverId })
      .populate("truck")
      .populate("trailer")
      .populate("driver");

    res.status(200).json({
      success: true,
      message: "Mes trajets assignés",
      data: trips
    });
  } catch (err) {
    next(err);
  }
};
