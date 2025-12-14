import Trip from "../models/Trip.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import User from "../models/User.model.js";
import Pneu from "../models/Pneu.model.js";

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
      .populate("truck", "immatriculation modele status")
      .populate("trailer", "plateNumber type status")
      .populate("driver", "name email")
      .sort({ createdAt: -1 });
    
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
      .populate("truck", "immatriculation modele status")
      .populate("trailer", "plateNumber type status")
      .populate("driver", "name email");

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

    for (let key in req.body) {
      trip[key] = req.body[key];
    }

    await trip.save();

    await trip.populate("truck", "immatriculation modele status");
    await trip.populate("trailer", "plateNumber type status");
    await trip.populate("driver", "name email");

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

    //  Vérifier si le truck est disponible
    const truck = await Truck.findById(trip.truck);
    if (!truck) {
      return res.status(404).json({ success: false, message: "Camion non trouvé" });
    }
    if (truck.status === 'en_maintenance' || truck.status === 'hors_service') {
      return res.status(400).json({ 
        success: false, 
        message: `Impossible de démarrer : le camion est ${truck.status}` 
      });
    }

    //  Vérifier si le trailer est disponible
    const trailer = await Trailer.findById(trip.trailer);
    if (!trailer) {
      return res.status(404).json({ success: false, message: "Remorque non trouvée" });
    }
    if (trailer.status === 'en_maintenance' || trailer.status === 'hors_service') {
      return res.status(400).json({ 
        success: false, 
        message: `Impossible de démarrer : la remorque est ${trailer.status}` 
      });
    }

    //Vérifier si des pneus du truck sont en maintenance
    const pneusTruckProblematiques = await Pneu.find({
      truck: trip.truck,
      status: { $in: ['en_maintenance', 'hors_service'] }
    });
    if (pneusTruckProblematiques.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de démarrer : ${pneusTruckProblematiques.length} pneu(s) du camion sont en maintenance/hors service`
      });
    }

    // Vérifier si des pneus du trailer sont en maintenance
    const pneusTrailerProblematiques = await Pneu.find({
      trailer: trip.trailer,
      status: { $in: ['en_maintenance', 'hors_service'] }
    });
    if (pneusTrailerProblematiques.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de démarrer : ${pneusTrailerProblematiques.length} pneu(s) de la remorque sont en maintenance/hors service`
      });
    }

    const { kmDepart, carburantDepart } = req.body;

    trip.status = "en-cours";
    trip.datDepart = new Date();
    if (kmDepart !== undefined) trip.kmDepart = kmDepart;
    if (carburantDepart !== undefined) trip.carburantDepart = carburantDepart;

    await trip.save();

    console.log(`🚀 Démarrage trajet ${trip._id}...`);
    
    // Mettre à jour UNIQUEMENT les véhicules disponibles
    const truckUpdate = await Truck.findByIdAndUpdate(
      trip.truck, 
      { status: "en_mission" },
      { new: true }
    );
    console.log(`Truck ${trip.truck} statut: ${truckUpdate?.status}`);
    
    const trailerUpdate = await Trailer.findByIdAndUpdate(
      trip.trailer, 
      { status: "en_mission" },
      { new: true }
    );
    console.log(`Trailer ${trip.trailer} statut: ${trailerUpdate?.status}`);
    
    //  Mettre à jour UNIQUEMENT les pneus disponibles (pas ceux en maintenance)
    const pneusTruckUpdate = await Pneu.updateMany(
      { 
        truck: trip.truck,
        status: { $nin: ['en_maintenance', 'hors_service'] } // ← Exclure maintenance
      },
      { status: "en_mission" }
    );
    console.log(` ${pneusTruckUpdate.modifiedCount} pneus du truck mis en mission`);
    
    const pneusTrailerUpdate = await Pneu.updateMany(
      { 
        trailer: trip.trailer,
        status: { $nin: ['en_maintenance', 'hors_service'] } // ← Exclure maintenance
      },
      { status: "en_mission" }
    );
    console.log(` ${pneusTrailerUpdate.modifiedCount} pneus du trailer mis en mission`);

    res.status(200).json({
      success: true,
      message: "Trajet commencé",
      data: trip
    });

  } catch (err) {
    console.error(" Erreur startTrip:", err);
    next(err);
  }
};

export const endTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) 
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    if (trip.status !== 'en-cours') {
      return res.status(400).json({ 
        success: false, 
        message: "Le trajet n'est pas en cours" 
      });
    }

    const { kmArrivee, carburantArrivee } = req.body;

    if (trip.kmDepart && kmArrivee && kmArrivee < trip.kmDepart) {
      return res.status(400).json({
        success: false,
        message: "Le kilométrage d'arrivée ne peut pas être inférieur au kilométrage de départ"
      });
    }

    trip.status = "termine";
    trip.dateArrivee = new Date();
    if (kmArrivee !== undefined) trip.kmArrivee = kmArrivee;
    if (carburantArrivee !== undefined) trip.carburantArrivee = carburantArrivee;

    await trip.save();

    console.log(`🏁 Fin trajet ${trip._id}...`);

    //  Mettre à jour le kilométrage du truck
    if (trip.kmDepart && kmArrivee) {
      const kmParcourus = kmArrivee - trip.kmDepart;
      const truck = await Truck.findById(trip.truck);
      if (truck) {
        truck.kilometrage += kmParcourus;
        truck.status = "disponible";
        await truck.save();
        console.log(` Truck ${trip.truck} : +${kmParcourus} km, statut: ${truck.status}`);
      }
    } else {
      await Truck.findByIdAndUpdate(trip.truck, { status: "disponible" });
      console.log(` Truck ${trip.truck} statut: disponible`);
    }

    //  Remettre le trailer en disponible
    const trailerUpdate = await Trailer.findByIdAndUpdate(
      trip.trailer, 
      { status: "disponible" },
      { new: true }
    );
    console.log(` Trailer ${trip.trailer} statut: ${trailerUpdate?.status}`);
    
    //  Remettre UNIQUEMENT les pneus en mission à disponible (pas ceux en maintenance)
    const pneusTruckUpdate = await Pneu.updateMany(
      { 
        truck: trip.truck,
        status: "en_mission" // ← Seulement ceux en mission
      },
      { status: "disponible" }
    );
    console.log(` ${pneusTruckUpdate.modifiedCount} pneus du truck remis à disponible`);
    
    const pneusTrailerUpdate = await Pneu.updateMany(
      { 
        trailer: trip.trailer,
        status: "en_mission" // ← Seulement ceux en mission
      },
      { status: "disponible" }
    );
    console.log(` ${pneusTrailerUpdate.modifiedCount} pneus du trailer remis à disponible`);

    res.status(200).json({
      success: true,
      message: "Trajet terminé avec succès",
      data: trip
    });

  } catch (err) {
    console.error(" Erreur endTrip:", err);
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