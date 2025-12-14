import Trip from "../models/Trip.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import User from "../models/User.model.js";
import Pneu from "../models/Pneu.model.js";
import PDFDocument from 'pdfkit';

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

    if (trailer) {
      const trailerExists = await Trailer.findById(trailer);
      if (!trailerExists) return res.status(400).json({ success: false, message: "Remorque invalide" });
    }

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

    if (trip.trailer) {
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
    }

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

    const { carburantDepart, remarquesVehicule } = req.body;

    trip.status = "en-cours";
    trip.datDepart = new Date();
    
    //Récupérer le kilométrage actuel du truck
    trip.kmDepart = truck.kilometrage;
    
    if (carburantDepart !== undefined) trip.carburantDepart = carburantDepart;
    if (remarquesVehicule) trip.remarquesVehicule = remarquesVehicule;

    await trip.save();

    // Mettre à jour les statuts des véhicules
    const truckUpdate = await Truck.findByIdAndUpdate(
      trip.truck, 
      { status: "en_mission" },
      { new: true }
    );
    // console.log(`Truck ${trip.truck} statut: ${truckUpdate?.status}, km: ${truck.kilometrage}`);
    
    if (trip.trailer) {
      const trailerUpdate = await Trailer.findByIdAndUpdate(
        trip.trailer, 
        { status: "en_mission" },
        { new: true }
      );
      // console.log(`Trailer ${trip.trailer} statut: ${trailerUpdate?.status}`);
    }
    
    const pneusTruckUpdate = await Pneu.updateMany(
      { 
        truck: trip.truck,
        status: { $nin: ['en_maintenance', 'hors_service'] }
      },
      { status: "en_mission" }
    );
    // console.log(`${pneusTruckUpdate.modifiedCount} pneus du truck mis en mission`);
    
    if (trip.trailer) {
      const pneusTrailerUpdate = await Pneu.updateMany(
        { 
          trailer: trip.trailer,
          status: { $nin: ['en_maintenance', 'hors_service'] }
        },
        { status: "en_mission" }
      );
      // console.log(` ${pneusTrailerUpdate.modifiedCount} pneus du trailer mis en mission`);
    }

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

    const { kmArrivee, carburantArrivee, remarquesVehicule } = req.body;

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
    if (remarquesVehicule) trip.remarquesVehicule = remarquesVehicule;

    await trip.save();

    // console.log(` Fin trajet ${trip._id}...`);

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

    //  Remettre le trailer en disponible (seulement s'il existe)
    if (trip.trailer) {
      const trailerUpdate = await Trailer.findByIdAndUpdate(
        trip.trailer, 
        { status: "disponible" },
        { new: true }
      );
      console.log(` Trailer ${trip.trailer} statut: ${trailerUpdate?.status}`);
    }
    
    //  Remettre UNIQUEMENT les pneus en mission à disponible (pas ceux en maintenance)
    const pneusTruckUpdate = await Pneu.updateMany(
      { 
        truck: trip.truck,
        status: "en_mission" // ← Seulement ceux en mission
      },
      { status: "disponible" }
    );
    console.log(` ${pneusTruckUpdate.modifiedCount} pneus du truck remis à disponible`);
    
    if (trip.trailer) {
      const pneusTrailerUpdate = await Pneu.updateMany(
        { 
          trailer: trip.trailer,
          status: "en_mission"
        },
        { status: "disponible" }
      );
      console.log(` ${pneusTrailerUpdate.modifiedCount} pneus du trailer remis à disponible`);
    }

    res.status(200).json({
      success: true,
      message: "Trajet terminé avec succès",
      data: trip
    });

  } catch (err) {
    // console.error(" Erreur endTrip:", err);
    next(err);
  }
};

export const getTripByDriver = async(req,res,next)=>{
    try{
        const driverId = req.user.id;

        const trips = await Trip.find({ driver: driverId })
          .populate("truck", "immatriculation marque modele status kilometrage")
          .populate("trailer", "plateNumber type status")
          .populate("driver", "name email")
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          message: "Mes trajets assignés",
          data: trips
        });
    } catch (err) {
        next(err);
    }
};

export const downloadTripPDF = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("truck", "immatriculation marque modele")
      .populate("trailer", "plateNumber type")
      .populate("driver", "name email");

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });
    }

    if (req.user.role === 'driver' && trip.driver._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès non autorisé" });
    }

    // Créer un document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ordre-mission-${trip._id}.pdf`);

    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text('ORDRE DE MISSION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`N° ${trip._id}`, { align: 'center' });
    doc.moveDown(2);

    // Informations du trajet
    doc.fontSize(14).text('Détails du trajet', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Lieu de départ : ${trip.lieuDepart}`);
    doc.text(`Lieu d'arrivée : ${trip.lieuArrivee}`);
    doc.text(`Date de départ : ${new Date(trip.datDepart).toLocaleDateString('fr-FR')}`);
    doc.text(`Date d'arrivée : ${new Date(trip.dateArrivee).toLocaleDateString('fr-FR')}`);
    doc.text(`Type : ${trip.type}`);
    doc.text(`Statut : ${trip.status}`);
    doc.moveDown();

    // Informations du chauffeur
    doc.fontSize(14).text('Chauffeur', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Nom : ${trip.driver.name}`);
    doc.text(`Email : ${trip.driver.email}`);
    doc.moveDown();

    // Informations du véhicule
    doc.fontSize(14).text('Véhicule', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Camion : ${trip.truck.immatriculation} (${trip.truck.marque} ${trip.truck.modele})`);
    if (trip.trailer) {
      doc.text(`Remorque : ${trip.trailer.plateNumber} (${trip.trailer.type})`);
    }
    doc.moveDown();

    // Kilométrage et carburant
    if (trip.kmDepart || trip.kmArrivee || trip.carburantDepart || trip.carburantArrivee) {
      doc.fontSize(14).text('Relevés', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      if (trip.kmDepart) doc.text(`Kilométrage départ : ${trip.kmDepart} km`);
      if (trip.kmArrivee) doc.text(`Kilométrage arrivée : ${trip.kmArrivee} km`);
      if (trip.carburantDepart) doc.text(`Carburant départ : ${trip.carburantDepart} L`);
      if (trip.carburantArrivee) doc.text(`Carburant arrivée : ${trip.carburantArrivee} L`);
      doc.moveDown();
    }

    // Remarques
    if (trip.remarquesVehicule) {
      doc.fontSize(14).text('Remarques sur le véhicule', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(trip.remarquesVehicule);
      doc.moveDown();
    }

    // Notes
    if (trip.notes) {
      doc.fontSize(14).text('Notes', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(trip.notes);
      doc.moveDown();
    }

    // Signature
    doc.moveDown(3);
    doc.fontSize(11);
    doc.text('Signature du chauffeur :', { continued: false });
    doc.moveDown(3);
    doc.text('_________________________');

    doc.end();

  } catch (err) {
    next(err);
  }
};