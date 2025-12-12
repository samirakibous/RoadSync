import { notificationEmitter } from "../events/notificationEmitter.js";
import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

notificationEmitter.on('vidangeDue', async (notification) => {
  try {
    console.log('📢 ========== NOTIFICATION VIDANGE ==========');
    console.log('Type:', notification.type);
    console.log('Ressource:', notification.resourceType);
    console.log('ID Ressource:', notification.resource._id);
    console.log('Message:', notification.message);
    console.log('Maintenance ID:', notification.maintenanceId);
    console.log('===========================================');
    
    // ✅ Vérifier si une notification existe déjà pour cette maintenance (non lue)
    // Pour les trucks sans maintenance (maintenanceId = null), on vérifie par resource
    let existingNotification;
    
    if (notification.maintenanceId) {
      existingNotification = await Notification.findOne({
        maintenance: notification.maintenanceId,
        read: false
      });
    } else {
      // Cas truck sans maintenance : vérifier si notification déjà envoyée pour ce type
      existingNotification = await Notification.findOne({
        message: notification.message,
        read: false
      });
    }

    if (existingNotification) {
      console.log('ℹ️ Notification déjà existante, ignorée pour éviter les doublons');
      return;
    }
    
    // ✅ Récupérer tous les admins pour leur envoyer la notification
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.warn('⚠️ Aucun admin trouvé pour recevoir la notification');
      return;
    }

    // ✅ Créer une notification pour chaque admin
    const notificationPromises = admins.map(admin => 
      Notification.create({
        user: admin._id,
        type: 'maintenance_due',
        message: notification.message,
        maintenance: notification.maintenanceId, // Peut être null pour trucks sans maintenance
        read: false
      })
    );

    await Promise.all(notificationPromises);
    
    console.log(`✅ ${admins.length} notification(s) créée(s) en base de données !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la notification:', error);
  }
});