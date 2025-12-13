import Pneu from "../models/Pneu.model.js";

export const createPneu = async (req, res, next) => {
  try {
    const { position, usurePourcentage, truck, trailer, status, marque, lastMaintenance, dateInstallation } = req.body;

    //un pneu ne peut pas être attaché à la fois à un truck et à une trailer
    if (truck && trailer) {
      return res.status(400).json({ success: false, message: "Un pneu ne peut pas être attaché à la fois à un truck et à une trailer." });
    }

    const existingPneu = await Pneu.findOne({ position, truck, trailer });
    if (existingPneu) {
      return res.status(400).json({ success: false, message: "Un pneu existe déjà à cette position pour ce véhicule." });
    }

    const pneu = await Pneu.create({
      position,
      usurePourcentage,
      truck,
      trailer,
      status,
      marque,
      lastMaintenance,
      dateInstallation
    });

    res.status(201).json({
      success: true,
      message: "Pneu créé avec succès",
      data: pneu
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPneus = async (req, res, next) => {
  try {
    const pneusRaw = await Pneu.find();
    console.log("Pneus bruts:", JSON.stringify(pneusRaw, null, 2));
   
    const pneus = await Pneu.find()
      .populate("truck", "immatriculation marque modele")
      .populate("trailer", "plateNumber type")
      .sort({ createdAt: -1 });
      
    console.log("Pneus populés:", JSON.stringify(pneus, null, 2));
    
    res.status(200).json({
      success: true,
      message: "Liste des pneus",
      data: pneus
    });
  } catch (err) {
    next(err);
  }
};

export const getPneuById = async (req, res, next) => {
  try {
    const pneu = await Pneu.findById(req.params.id)
      .populate("truck", "immatriculation marque modele")
      .populate("trailer", "plateNumber type");
      
    if (!pneu) return res.status(404).json({ success: false, message: "Pneu non trouvé" });

    res.status(200).json({
      success: true,
      message: "Pneu trouvé",
      data: pneu
    });
  } catch (err) {
    next(err);
  }
};

export const updatePneu = async (req, res, next) => {
  try {
    const { position, usurePourcentage, truck, trailer, status, marque, lastMaintenance, dateInstallation } = req.body;

    if (truck && trailer) {
      return res.status(400).json({ success: false, message: "Un pneu ne peut pas être attaché à la fois à un truck et à une trailer." });
    }

    const pneu = await Pneu.findById(req.params.id);
    if (!pneu) return res.status(404).json({ success: false, message: "Pneu non trouvé" });

    pneu.position = position ?? pneu.position;
    pneu.usurePourcentage = usurePourcentage ?? pneu.usurePourcentage;
    pneu.truck = truck ?? pneu.truck;
    pneu.trailer = trailer ?? pneu.trailer;
    pneu.status = status ?? pneu.status;
    pneu.marque = marque ?? pneu.marque;
    pneu.lastMaintenance = lastMaintenance ?? pneu.lastMaintenance;
    pneu.dateInstallation = dateInstallation ?? pneu.dateInstallation;

    await pneu.save();
    
    await pneu.populate("truck", "immatriculation marque modele");
    await pneu.populate("trailer", "plateNumber type");

    res.status(200).json({
      success: true,
      message: "Pneu mis à jour avec succès",
      data: pneu
    });
  } catch (err) {
    next(err);
  }
};

export const deletePneu = async (req, res, next) => {
  try {
    const pneu = await Pneu.findByIdAndDelete(req.params.id);
    if (!pneu) return res.status(404).json({ success: false, message: "Pneu non trouvé" });

    res.status(200).json({
      success: true,
      message: "Pneu supprimé avec succès"
    });
  } catch (err) {
    next(err);
  }
};
