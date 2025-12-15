import FuelLog from "../models/FuelLog.model.js";

export const createFuelLog = async (req, res) => {
  try {
    const { trip, montant } = req.body;

    let factureUrl = null;
    let factureType = null;

    if (req.file) {
      factureUrl = `/uploads/fuelLogs/${req.file.filename}`;

      // image ou pdf
      factureType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    }
console.log("BODY:", req.body);
console.log("MONTANT:", montant, typeof montant);
    const fuelLog = await FuelLog.create({
      trip,
      montant,
      factureUrl,
      factureType
    });

    res.status(201).json({
      success: true,
      message: "Fuel log créé avec succès",
      data: fuelLog
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllFuelLogs = async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find()
      .populate({
        path: 'trip',
        select: 'lieuDepart lieuArrivee datDepart status',
        populate: {
          path: 'driver',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: fuelLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Récupérer MES fuel logs (chauffeur connecté)
export const getMyFuelLogs = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Trouver tous les fuel logs des trips du driver
    const fuelLogs = await FuelLog.find()
      .populate({
        path: 'trip',
        match: { driver: driverId }, // Filtrer par driver
        select: 'lieuDepart lieuArrivee datDepart status driver',
        populate: {
          path: 'driver',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Filtrer les null (trips qui ne correspondent pas au driver)
    const filteredLogs = fuelLogs.filter(log => log.trip !== null);

    res.status(200).json({ success: true, data: filteredLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFuelLogByTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const fuelLogs = await FuelLog.find({ trip: id })
      .populate({
        path: 'trip',
        select: 'lieuDepart lieuArrivee datDepart status',
        populate: {
          path: 'driver',
          select: 'name email'
        }
      });
      
    res.status(200).json({ success: true, data: fuelLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFuelLog = async (req, res) => {
  try {
    const { id } = req.params;
    await FuelLog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Fuel log supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};