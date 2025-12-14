import Pneu from "../models/Pneu.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";

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

    console.log("UPDATE PNEU - Données reçues:", { position, usurePourcentage, truck, trailer, status, marque });

    if (truck && trailer) {
      return res.status(400).json({ success: false, message: "Un pneu ne peut pas être attaché à la fois à un truck et à une trailer." });
    }

    const pneu = await Pneu.findById(req.params.id);
    if (!pneu) return res.status(404).json({ success: false, message: "Pneu non trouvé" });

    const oldTruck = pneu.truck;
    const oldTrailer = pneu.trailer;
    const oldStatus = pneu.status;

    console.log("Ancien état:", { oldStatus, oldTruck, oldTrailer });

    pneu.position = position ?? pneu.position;
    pneu.usurePourcentage = usurePourcentage ?? pneu.usurePourcentage;
    pneu.truck = truck ?? pneu.truck;
    pneu.trailer = trailer ?? pneu.trailer;
    pneu.status = status ?? pneu.status;
    pneu.marque = marque ?? pneu.marque;
    pneu.lastMaintenance = lastMaintenance ?? pneu.lastMaintenance;
    pneu.dateInstallation = dateInstallation ?? pneu.dateInstallation;

    console.log("Nouveau état:", { status: pneu.status, truck: pneu.truck, trailer: pneu.trailer });

    await pneu.save();

    // Même si le statut du pneu n'a pas changé, forcer la vérification
    if (pneu.status === 'en_maintenance' || pneu.status === 'hors_service') {
      if (pneu.truck) {
        const truckUpdate = await Truck.findByIdAndUpdate(
          pneu.truck,
          { status: 'hors_service' },
          { new: true }
        );
        // console.log(`Truck ${pneu.truck} mis en hors_service (pneu en ${pneu.status})`);
        // console.log(`   Statut truck après update: ${truckUpdate?.status}`);
      }

      if (pneu.trailer) {
        const trailerUpdate = await Trailer.findByIdAndUpdate(
          pneu.trailer,
          { status: 'hors_service' },
          { new: true }
        );
        // console.log(` Trailer ${pneu.trailer} mis en hors_service (pneu en ${pneu.status})`);
        // console.log(`   Statut trailer après update: ${trailerUpdate?.status}`);
      }
    } else if (pneu.status === 'disponible' || pneu.status === 'en_mission') {
      // Vérifier si on peut remettre le véhicule disponible
      if (pneu.truck) {
        const problematicPneus = await Pneu.find({
          truck: pneu.truck,
          _id: { $ne: pneu._id },
          status: { $in: ['en_maintenance', 'hors_service'] }
        });

        if (problematicPneus.length === 0) {
          await Truck.findByIdAndUpdate(pneu.truck, { status: 'disponible' });
          // console.log(` Truck ${pneu.truck} remis disponible (tous les pneus OK)`);
        } else {
          // console.log(` Truck ${pneu.truck} reste hors_service (${problematicPneus.length} pneus problématiques)`);
        }
      }

      if (pneu.trailer) {
        const problematicPneus = await Pneu.find({
          trailer: pneu.trailer,
          _id: { $ne: pneu._id },
          status: { $in: ['en_maintenance', 'hors_service'] }
        });

        if (problematicPneus.length === 0) {
          await Trailer.findByIdAndUpdate(pneu.trailer, { status: 'disponible' });
          // console.log(`Trailer ${pneu.trailer} remis disponible (tous les pneus OK)`);
        } else {
          // console.log(`Trailer ${pneu.trailer} reste hors_service (${problematicPneus.length} pneus problématiques)`);
        }
      }
    }

    // Gérer le changement de véhicule
    if (oldTruck && oldTruck.toString() !== (truck || '').toString()) {
      const remainingPneus = await Pneu.find({
        truck: oldTruck,
        status: { $in: ['en_maintenance', 'hors_service'] }
      });

      if (remainingPneus.length === 0) {
        await Truck.findByIdAndUpdate(oldTruck, { status: 'disponible' });
        console.log(`Ancien truck ${oldTruck} remis disponible`);
      }
    }

    if (oldTrailer && oldTrailer.toString() !== (trailer || '').toString()) {
      const remainingPneus = await Pneu.find({
        trailer: oldTrailer,
        status: { $in: ['en_maintenance', 'hors_service'] }
      });

      if (remainingPneus.length === 0) {
        await Trailer.findByIdAndUpdate(oldTrailer, { status: 'disponible' });
        // console.log(`Ancien trailer ${oldTrailer} remis disponible`);
      }
    }

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
    const pneu = await Pneu.findById(req.params.id);
    if (!pneu) return res.status(404).json({ success: false, message: "Pneu non trouvé" });

    const truckId = pneu.truck;
    const trailerId = pneu.trailer;

    await Pneu.findByIdAndDelete(req.params.id);

    // Vérifier si le véhicule peut redevenir disponible après suppression du pneu
    if (truckId) {
      const remainingPneus = await Pneu.find({
        truck: truckId,
        status: { $in: ['en_maintenance', 'hors_service'] }
      });

      if (remainingPneus.length === 0) {
        await Truck.findByIdAndUpdate(truckId, { status: 'disponible' });
      }
    }

    if (trailerId) {
      const remainingPneus = await Pneu.find({
        trailer: trailerId,
        status: { $in: ['en_maintenance', 'hors_service'] }
      });

      if (remainingPneus.length === 0) {
        await Trailer.findByIdAndUpdate(trailerId, { status: 'disponible' });
      }
    }

    res.status(200).json({
      success: true,
      message: "Pneu supprimé avec succès"
    });
  } catch (err) {
    next(err);
  }
};
