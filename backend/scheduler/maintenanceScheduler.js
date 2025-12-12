import { MaintenanceService } from "../services/maintenance.services.js";

export const startMaintenanceScheduler = () => {
  console.log("========== SCHEDULER DÉMARRÉ ==========");
  console.log(" Intervalle: toutes les 60 secondes");
  console.log("==========================================");
  
  // Vérifier immédiatement au démarrage
  MaintenanceService.notifyDueVidanges()
    .then(() => console.log(" Première vérification terminée"))
    .catch(err => console.error(" Erreur lors de la première vérification:", err));
  
  // Vérifier toutes les 1 minute
  setInterval(async () => {
    console.log(" Exécution du scheduler...");
    try {
      await MaintenanceService.notifyDueVidanges();
      console.log(" Vérification de maintenance terminée");
    } catch (err) {
      console.error(" Erreur dans le scheduler de maintenance:", err);
    }
  }, 60 * 1000);
};