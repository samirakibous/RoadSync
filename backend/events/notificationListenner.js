import { notificationEmitter } from './notificationEmitter.js';
import Notification from '../models/Notification.model.js';

notificationEmitter.on('maintenance_created', async (payload) => {
  try {
    console.log('Création de la notification');
    await Notification.create({
      type: 'maintenance',
      message: `Maintenance créée pour la ressource ${payload.resourceId}`,
      maintenance: payload.maintenanceId,
    });
    console.log('Notification créée pour la maintenance !');
  } catch (err) {
    console.error('Erreur lors de la création de la notification', err);
  }
});
