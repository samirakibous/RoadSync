import Truck from "../models/Truck.model.js";

export const createTruck = async (req, res, next) => {
  try {
    const { immatriculation, modele, kilometrage, statut, dateAchat, derniereMaintenance } = req.body;

    const existingTruck = await Truck.findOne({ immatriculation });
    if (existingTruck) {
      return res.status(400).json({ success: false, message: "Camion déjà existant avec cette immatriculation" });
    }

    const truck = await Truck.create({
      immatriculation,
      modele,
      kilometrage,
      statut,
      dateAchat,
      derniereMaintenance
    });

    res.status(201).json({
      success: true,
      message: "Camion créé avec succès",
      data: truck
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTrucks=async(req,res,next)=>{
    try{
        const trucks=await Truck.find();
        res.status(200).json({
            success:true,
            message:"Liste des camions",
            data:trucks
        })
    }catch(err){
        next(err);
    }
}

export const updateTruck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTruck = await Truck.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTruck) {
      return res.status(404).json({ success: false, message: "Camion non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: "Camion mis à jour avec succès",
      data: updatedTruck
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTruck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const truck = await Truck.findByIdAndDelete(id);

    if (!truck) {
      return res.status(404).json({ success: false, message: "Camion non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: "Camion supprimé avec succès"
    });
  } catch (err) {
    next(err);
  }
};

export const getTruckById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ success: false, message: "Camion non trouvé" });
    }
    res.status(200).json({ success: true, data: truck });
  } catch (err) {
    next(err);
  }
};