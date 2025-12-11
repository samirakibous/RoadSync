import MaintenanceRule from "../models/MaintenanceRule.model.js";
import { maintenanceRuleSchema } from "../validations/MaintenanceRole.js";

export const createMaintenanceRule = async (req, res, next) => {
  try {
    // console.log("req.body", req.body);
    await maintenanceRuleSchema.validate(req.body, { abortEarly: false });
    const { type, action, intervalKm, intervalDays, description, active } = req.body;

    const rule = await MaintenanceRule.create({
      type,
      action,
      intervalKm,
      intervalDays,
      description,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Règle de maintenance créée avec succès",
      data: rule,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllMaintenanceRules = async (req, res, next) => {
  try {
    const rules = await MaintenanceRule.find();
    res.status(200).json({
      success: true,
      message: "Liste des règles de maintenance",
      data: rules,
    });
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceRuleById = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Règle de maintenance non trouvée",
      });
    }
    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenanceRule = async (req, res, next) => {
  try {
    await maintenanceRuleSchema.validate(req.body, { abortEarly: false });
    const rule = await MaintenanceRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Règle de maintenance non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Règle de maintenance mise à jour",
      data: rule,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenanceRule = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Règle de maintenance non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Règle de maintenance supprimée avec succès",
    });
  } catch (err) {
    next(err);
  }
};
