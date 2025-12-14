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

    if (rule) {
      const ruleExists = await MaintenanceRule.findById(rule);
      if (!ruleExists) throw new Error("Règle de maintenance non trouvée");
    }

    const maintenance = await Maintenance.create(data);

    // ✅ Mettre à jour le statut de la ressource en "en_maintenance"
    console.log(`🔧 Maintenance créée pour ${resourceType} ${resource}`);
    const updated = await Model.findByIdAndUpdate(
      resource, 
      { 
        status: "en_maintenance",
        lastMaintenance: new Date() 
      },
      { new: true }
    );
    console.log(`✅ Statut mis à jour: ${updated?.status}`);

    // ✅ Si c'est un pneu, mettre le véhicule associé hors service
    if (resourceType === "pneu" && updated) {
      if (updated.truck) {
        await Truck.findByIdAndUpdate(
          updated.truck,
          { status: 'hors_service' },
          { new: true }
        );
        console.log(`✅ Truck ${updated.truck} mis hors_service (pneu en maintenance)`);
      }
      
      if (updated.trailer) {
        await Trailer.findByIdAndUpdate(
          updated.trailer,
          { status: 'hors_service' },
          { new: true }
        );
        console.log(`✅ Trailer ${updated.trailer} mis hors_service (pneu en maintenance)`);
      }
    }

    return maintenance;
  },

  findAll: () => Maintenance.find()
    .populate({
      path: 'resource',
      select: 'immatriculation marque modele plateNumber type position status'
    })
    .populate("rule", "type action")
    .sort({ createdAt: -1 }),

  findById: (id) => Maintenance.findById(id)
    .populate({
      path: 'resource',
      select: 'immatriculation marque modele plateNumber type position status'
    })
    .populate("rule", "type action"),

  update: async (id, data) => {
    const maintenance = await Maintenance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (maintenance) {
      await maintenance.populate({
        path: 'resource',
        select: 'immatriculation marque modele plateNumber type position status'
      });
      await maintenance.populate("rule", "type action");
    }
    return maintenance;
  },

  delete: async (id) => {
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) return null;

    // ✅ Remettre le statut de la ressource à "disponible"
    let Model;
    if (maintenance.resourceType === "truck") Model = Truck;
    else if (maintenance.resourceType === "trailer") Model = Trailer;
    else if (maintenance.resourceType === "pneu") Model = Pneu;

    if (Model) {
      console.log(`🗑️ Suppression maintenance ${id}`);
      const updated = await Model.findByIdAndUpdate(
        maintenance.resource, 
        { status: "disponible" },
        { new: true }
      );
      console.log(`✅ Ressource ${maintenance.resource} remise à: ${updated?.status}`);

      // ✅ Si c'est un pneu, vérifier si on peut remettre le véhicule disponible
      if (maintenance.resourceType === "pneu" && updated) {
        if (updated.truck) {
          const problematicPneus = await Pneu.find({
            truck: updated.truck,
            _id: { $ne: updated._id },
            status: { $in: ['en_maintenance', 'hors_service'] }
          });

          if (problematicPneus.length === 0) {
            await Truck.findByIdAndUpdate(updated.truck, { status: 'disponible' });
            console.log(`✅ Truck ${updated.truck} remis disponible (tous les pneus OK)`);
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
            console.log(`✅ Trailer ${updated.trailer} remis disponible (tous les pneus OK)`);
          }
        }
      }
    }

    return Maintenance.findByIdAndDelete(id);
  },

  completeMaintenance: async (id) => {
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) throw new Error("Maintenance non trouvée");

    // Remettre le statut de la ressource à "disponible"
    let Model;
    if (maintenance.resourceType === "truck") Model = Truck;
    else if (maintenance.resourceType === "trailer") Model = Trailer;
    else if (maintenance.resourceType === "pneu") Model = Pneu;

    if (Model) {
      console.log(`✅ Maintenance ${id} terminée`);
      const updated = await Model.findByIdAndUpdate(
        maintenance.resource, 
        { 
          status: "disponible",
          lastMaintenance: new Date()
        },
        { new: true }
      );
      console.log(`✅ Ressource ${maintenance.resource} statut: ${updated?.status}`);

      // ✅ Si c'est un pneu, vérifier si on peut remettre le véhicule disponible
      if (maintenance.resourceType === "pneu" && updated) {
        if (updated.truck) {
          const problematicPneus = await Pneu.find({
            truck: updated.truck,
            _id: { $ne: updated._id },
            status: { $in: ['en_maintenance', 'hors_service'] }
          });

          if (problematicPneus.length === 0) {
            await Truck.findByIdAndUpdate(updated.truck, { status: 'disponible' });
            console.log(`✅ Truck ${updated.truck} remis disponible (tous les pneus OK)`);
          } else {
            console.log(`⚠️ Truck ${updated.truck} reste hors_service (${problematicPneus.length} pneus problématiques)`);
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
            console.log(`✅ Trailer ${updated.trailer} remis disponible (tous les pneus OK)`);
          } else {
            console.log(`⚠️ Trailer ${updated.trailer} reste hors_service (${problematicPneus.length} pneus problématiques)`);
          }
        }
      }
    }

    // Supprimer ou marquer comme terminée
    return Maintenance.findByIdAndDelete(id);
  },

  notifyDueVidanges: async () => {
    console.log("🔍 Vérification des maintenances dues...");
    
    const maintenances = await Maintenance.find()
      .populate("resource")
      .populate("rule");

    console.log(`Total maintenances trouvées: ${maintenances.length}`);

    const today = new Date();
    let notificationCount = 0;

    maintenances.forEach((m, index) => {
      console.log(`\n--- Maintenance ${index + 1} ---`);
      console.log(`Resource populated: ${!!m.resource}`);
      console.log(`Rule populated: ${!!m.rule}`);
      
      if (!m.resource) {
        console.log(`Resource non populée`);
        return;
      }
      
      if (!m.rule) {
        console.log(`Rule non populée`);
        return;
      }

      console.log(`Action: ${m.rule.action}, Km actuel: ${m.resource.kilometrage}, KmMaintenance: ${m.kmAtMaintenance}, IntervalKm: ${m.rule.intervalKm}`);

      const nextKm = m.kmAtMaintenance + (m.rule.intervalKm || 0);
      const nextDate = new Date(m.createdAt);
      if (m.rule.intervalDays) nextDate.setDate(nextDate.getDate() + m.rule.intervalDays);

      const isDueKm = m.resource.kilometrage >= nextKm;
      const isDueDate = today >= nextDate;
      const isDue = isDueKm || isDueDate;

      console.log(`NextKm: ${nextKm}, Due? ${isDue} (km:${isDueKm}, date:${isDueDate})`);

      if (isDue) {
        console.log(`NOTIFICATION ÉMISE pour ${m.resource.immatriculation || m.resource._id}`);
        
        notificationEmitter.emit("vidangeDue", {
          type: m.rule.action,
          maintenanceId: m._id,
          resourceType: m.resourceType,
          resource: m.resource,
          message: `⚠️ ${m.rule.action.toUpperCase()} urgente : ${m.resourceType} ${m.resource.immatriculation || 'N/A'} - ${m.resource.kilometrage} km`
        });
        
        notificationCount++;
      }
    });

    console.log('\n📌 Vérification des trucks sans maintenance...');
    const trucks = await Truck.find();
    console.log(`Total trucks trouvés: ${trucks.length}`);

    for (const truck of trucks) {
      const hasMaintenance = await Maintenance.findOne({ 
        resourceType: { $in: ['truck', 'Truck'] },
        resource: truck._id 
      });

      if (!hasMaintenance) {
        console.log(`⚠️ Truck ${truck.immatriculation} sans maintenance (${truck.kilometrage} km)`);
        
        if (truck.kilometrage >= 10000) {
          console.log(`ALERTE : Truck sans maintenance et >10000 km !`);
          
          notificationEmitter.emit("vidangeDue", {
            type: "premiere_maintenance",
            maintenanceId: null,
            resourceType: "truck",
            resource: truck,
            message: `URGENT : Truck ${truck.immatriculation} n'a JAMAIS eu de maintenance (${truck.kilometrage} km) !`
          });
          
          notificationCount++;
        }
      }
    }

    console.log(`\n✅ ${notificationCount} maintenance(s) due(s) détectée(s)`);
  }
};
