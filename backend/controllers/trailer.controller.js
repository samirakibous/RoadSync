import Trailer from "../models/Trailer.model.js";

export const createTrailer = async (req, res, next) => {
  try {
    const { plateNumber, type, maxLoad, status, purchaseDate, lastMaintenance } = req.body;

    const existingTrailer = await Trailer.findOne({ plateNumber });
    if (existingTrailer) {
      return res.status(400).json({ success: false, message: "Remorque déjà existante avec ce numéro de plaque" });
    }

    const trailer = await Trailer.create({
      plateNumber,
      type,
      maxLoad,
      status,
      purchaseDate,
      lastMaintenance,
    });

    res.status(201).json({
      success: true,
      message: "Remorque créée avec succès",
      data: trailer,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTrailers = async (req, res, next) => {
  try {
    const trailers = await Trailer.find();
    res.status(200).json({
      success: true,
      message: "Liste des remorques",
      data: trailers,
    });
  } catch (err) {
    next(err);
  }
};

export const getTrailerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trailer = await Trailer.findById(id);
    if (!trailer) {
      return res.status(404).json({ success: false, message: "Remorque non trouvée" });
    }
    res.status(200).json({ success: true, data: trailer });
  } catch (err) {
    next(err);
  }
};

export const updateTrailer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const trailer = await Trailer.findByIdAndUpdate(id, updates, { new: true });
    if (!trailer) {
      return res.status(404).json({ success: false, message: "Remorque non trouvée" });
    }

    res.status(200).json({
      success: true,
      message: "Remorque mise à jour avec succès",
      data: trailer,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTrailer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trailer = await Trailer.findByIdAndDelete(id);
    if (!trailer) {
      return res.status(404).json({ success: false, message: "Remorque non trouvée" });
    }

    res.status(200).json({
      success: true,
      message: "Remorque supprimée avec succès",
    });
  } catch (err) {
    next(err);
  }
};
