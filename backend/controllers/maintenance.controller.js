import { MaintenanceService } from "../services/maintenance.services.js";
import { notificationEmitter } from '../events/notificationEmitter.js';

export const createMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceService.create(req.body);
// Émettre l'événement
    notificationEmitter.emit('maintenance_created', {
      maintenanceId: maintenance._id,
      resourceId: maintenance.resource,
    });
    res.status(201).json({
      success: true,
      message: "Maintenance créée avec succès",
      data: maintenance,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllMaintenances = async (req, res, next) => {
  try {
    const maintenances = await MaintenanceService.findAll();

    res.status(200).json({
      success: true,
      data: maintenances,
    });
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceService.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance non trouvée",
      });
    }

    res.status(200).json({ success: true, data: maintenance });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceService.update(req.params.id, req.body);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance mise à jour",
      data: maintenance,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceService.delete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance supprimée",
    });
  } catch (err) {
    next(err);
  }
};
