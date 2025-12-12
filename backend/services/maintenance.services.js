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
    // await maintenance.populate("resource");
    // await maintenance.populate("rule");

    return maintenance;
  },

  findAll: () => Maintenance.find(),
  // .populate("resource").populate("rule"),

  findById: (id) => Maintenance.findById(id),
  // .populate("resource").populate("rule"),

  update: (id, data) =>
    Maintenance.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  delete: (id) => Maintenance.findByIdAndDelete(id),

  getMaintenancesDueForKm: async () => {
    const maintenances = await Maintenance.find()
      .populate("resource")
      .populate("rule");

    return maintenances.filter(m => {
      if (!m.rule || !m.rule.intervalKm) return false;
      return m.resource.kilometrage >= m.kmAtMaintenance + m.rule.intervalKm;
    });
  },

  getMaintenancesDueForDate: async () => {
    const maintenances = await Maintenance.find()
      .populate("resource")
      .populate("rule");

    const today = new Date();
    return maintenances.filter(m => {
      if (!m.rule || !m.rule.intervalDays || !m.createdAt) return false;
      const nextDate = new Date(m.createdAt);
      nextDate.setDate(nextDate.getDate() + m.rule.intervalDays);
      return today >= nextDate;
    });
  },

  // Calculer prochain km ou date de maintenance pour un objet Maintenance
  // calculateNextMaintenance: (maintenance) => {
  //   let nextKm = null;
  //   let nextDate = null;

  //   if (maintenance.rule?.intervalKm && maintenance.kmAtMaintenance != null) {
  //     nextKm = maintenance.kmAtMaintenance + maintenance.rule.intervalKm;
  //   }

  //   if (maintenance.rule?.intervalDays && maintenance.createdAt) {
  //     nextDate = new Date(maintenance.createdAt);
  //     nextDate.setDate(nextDate.getDate() + maintenance.rule.intervalDays);
  //   }

  //   return { nextKm, nextDate };
  // }

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

      // Calcul date et km de prochaine maintenance
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

    // Vérifier les trucks sans maintenance
    console.log('\n Vérification des trucks sans maintenance...');
    const trucks = await Truck.find();
    console.log(`Total trucks trouvés: ${trucks.length}`);

    for (const truck of trucks) {
      const hasMaintenance = await Maintenance.findOne({ 
        resourceType: { $in: ['truck', 'Truck'] },
        resource: truck._id 
      });

      if (!hasMaintenance) {
        console.log(`⚠️ Truck ${truck.immatriculation} sans maintenance (${truck.kilometrage} km)`);
        
        // Alerte si le truck a plus de 10000 km sans aucune maintenance
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

    console.log(`\n ${notificationCount} maintenance(s) due(s) détectée(s)`);
  }
};
