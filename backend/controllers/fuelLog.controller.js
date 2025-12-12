import FuelLog from "../models/FuelLog.model.js";

export const createFuelLog = async (req, res) => {
  try {
    const { trip, montant } = req.body;

    let factureUrl = null;
    let factureType = null;

    if (req.file) {
      factureUrl = `/uploads/factures/${req.file.filename}`;

      // image ou pdf
      factureType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    }

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
    const fuelLogs = await FuelLog.find().populate("trip");
    res.status(200).json({ success: true, data: fuelLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFuelLogByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const fuelLogs = await FuelLog.find({ trip: tripId }).populate("trip");
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
}