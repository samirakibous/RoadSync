import Notification from "../models/Notification.model.js";
import { notificationEmitter } from "../events/notificationEmitter.js";

export const NotificationService = {
  createVidangeNotification: async (maintenance) => {
    const notification = await Notification.create({
      type: 'vidange',
      maintenance: maintenance._id,
      message: `La vidange du ${maintenance.resourceType} ${maintenance.resource} est due.`,
      read: false,
    });

    notificationEmitter.emit('vidangeDue', notification);

    return notification;
  }
};
