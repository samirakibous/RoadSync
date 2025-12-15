import Maintenance from "../models/Maintenance.model.js";
import Truck from "../models/Truck.model.js";
import Trailer from "../models/Trailer.model.js";
import Pneu from "../models/Pneu.model.js";
import MaintenanceRule from "../models/MaintenanceRule.model.js";
import { notificationEmitter } from "../events/notificationEmitter.js";

export const MaintenanceService = {
  create: async (data) => {
    const { resourceType, resource, rule } = data;

    let Model;
    if (resourceType === "truck") Model = Truck;
    else if (resourceType === "trailer") Model = Trailer;
    else if (resourceType === "pneu") Model = Pneu;
    else throw new Error("Type de ressource invalide");

    const resourceExists = await Model.findById(resource);
    if (!resourceExists) throw new Error(`${resourceType} non trouvé`);

let kmAtMaintenance = null;

if (resourceType === "truck") {
  kmAtMaintenance = resourceExists.kilometrage;
}

if (resourceType === "trailer") {
  kmAtMaintenance = resourceExists.kilometrage;
}

if (resourceType === "pneu") {
  if (resourceExists.truck) {
    const truck = await Truck.findById(resourceExists.truck);
    kmAtMaintenance = truck?.kilometrage;
  }

  if (resourceExists.trailer) {
    const trailer = await Trailer.findById(resourceExists.trailer);
    kmAtMaintenance = trailer?.kilometrage;
  }
}

    if (rule) {
      const ruleExists = await MaintenanceRule.findById(rule);
      if (!ruleExists) throw new Error("Règle de maintenance non trouvée");
    }

    const maintenance = await Maintenance.create({
  ...data,
  kmAtMaintenance
});
    const updated = await Model.findByIdAndUpdate(
      resource, 
      { 
        status: "en_maintenance",
        lastMaintenance: new Date() 
      },
      { new: true }
    );
    if (resourceType === "pneu" && updated) {
      if (updated.truck) {
        await Truck.findByIdAndUpdate(
          updated.truck,
          { status: 'hors_service' },
          { new: true }
        );
      }
      
      if (updated.trailer) {
        await Trailer.findByIdAndUpdate(
          updated.trailer,
          { status: 'hors_service' },
          { new: true }
        );
      }
    }

    return maintenance;
  },

  findAll: () => Maintenance.find()
    .populate({
      path: 'resource',
      select: 'immatriculation marque modele plateNumber type position status kilometrage' // ✅ Correction
    })
    .populate("rule", "type action intervalKm intervalDays")
    .sort({ createdAt: -1 }),

  findById: (id) => Maintenance.findById(id)
    .populate({
      path: 'resource',
      select: 'immatriculation marque modele plateNumber type position status kilometrage' // ✅ Correction
    })
    .populate("rule", "type action intervalKm intervalDays"),

  update: async (id, data) => {
    const { resourceType, resource } = data;
    const maintenance = await Maintenance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (maintenance) {
      await maintenance.populate({
        path: 'resource',
        select: 'immatriculation marque modele plateNumber type position status kilometrage'
      });
      await maintenance.populate("rule", "type action intervalKm intervalDays");
    }
    return maintenance;
  },

  delete: async (id) => {
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) return null;
    let Model;
    if (maintenance.resourceType === "truck") Model = Truck;
    else if (maintenance.resourceType === "trailer") Model = Trailer;
    else if (maintenance.resourceType === "pneu") Model = Pneu;

    if (Model) {
      const updated = await Model.findByIdAndUpdate(
        maintenance.resource, 
        { status: "disponible" },
        { new: true }
      );
      if (maintenance.resourceType === "pneu" && updated) {
        if (updated.truck) {
          const problematicPneus = await Pneu.find({
            truck: updated.truck,
            _id: { $ne: updated._id },
            status: { $in: ['en_maintenance', 'hors_service'] }
          });

          if (problematicPneus.length === 0) {
            await Truck.findByIdAndUpdate(updated.truck, { status: 'disponible' });
          }
        }

        if (updated.trailer) {
          const problematicPneus = await Pneu.find({
            trailer: updated.trailer,
            _id: { $ne: updated._id },
            status: { $in: ['en_maintenance', 'hors_service'] }
          });

          if (problematicPneus.length === 0) {
            await Trailer.findByIdAndUpdate(updated.trailer, { status: 'disponible' });
          }
        }
      }
    }

    return Maintenance.findByIdAndDelete(id);
  },

  completeMaintenance: async (id) => {
    const maintenance = await Maintenance.findById(id).populate('resource');
    
    if (!maintenance) throw new Error('Maintenance non trouvée');
    
    // Marquer comme terminée
    maintenance.status = 'completed';
    maintenance.completedAt = new Date();
    await maintenance.save();
    
    // Remettre la ressource en service
    let Model;
    if (maintenance.resourceType === "truck") Model = Truck;
    else if (maintenance.resourceType === "trailer") Model = Trailer;
    else if (maintenance.resourceType === "pneu") Model = Pneu;
    
    await Model.findByIdAndUpdate(
      maintenance.resource._id,
      { status: 'disponible' }
    );
    
    return maintenance;
  },

  notifyDueVidanges: async () => {
    try {
      //les maintenances terminées
      const completedMaintenances = await Maintenance.find({ status: 'completed' })
        .populate({
          path: 'resource',
          select: 'immatriculation marque modele plateNumber type position status kilometrage'
        })
        .populate("rule", "type action intervalKm intervalDays");

      completedMaintenances.forEach((m) => {
        if (!m.rule || !m.rule.intervalKm || !m.resource) return;
        
        const nextKm = m.kmAtMaintenance + m.rule.intervalKm;
        const isDueKm = m.resource.kilometrage >= nextKm;

        if (isDueKm) {
          const resourceName = m.resource.immatriculation || m.resource.plateNumber || m.resource.position;
          
          notificationEmitter.emit("vidangeDue", {
            type: m.rule.action,
            maintenanceId: m._id,
            resourceType: m.resourceType,
            resource: m.resource,
            message: `⚠️ ${m.rule.action.toUpperCase()} urgente : ${m.resourceType} ${resourceName} - ${m.resource.kilometrage} km (prochain entretien prévu à ${nextKm} km)`
          });
        }
      });
     // les truck qui n'ont jalis eu de maintenance
      const trucksWithoutMaintenance = await Truck.find({
        _id: { 
          $nin: await Maintenance.distinct('resource', { resourceType: 'truck' }) 
        }
      });

      const firstVidangeRule = await MaintenanceRule.findOne({ 
        type: 'truck', 
        action: 'vidange',
        active: true 
      });

      if (firstVidangeRule) {
        trucksWithoutMaintenance.forEach((truck) => {
          if (truck.kilometrage >= (firstVidangeRule.intervalKm || 0)) {
            notificationEmitter.emit("vidangeDue", {
              type: 'vidange',
              maintenanceId: null,
              resourceType: 'truck',
              resource: truck,
              message: `⚠️ PREMIÈRE VIDANGE urgente : truck ${truck.immatriculation} - ${truck.kilometrage} km (seuil: ${firstVidangeRule.intervalKm} km)`
            });
          }
        });
      }

      console.log(`✅ Vérification des maintenances due terminée`);
    } catch (error) {
      console.error('❌ Erreur dans notifyDueVidanges:', error);
    }
  }
};
