import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import express from "express";
import * as maintenanceController from "../controllers/maintenance.controller.js";
import {validate} from '../middleware/validate.middleware.js';
import {maintenanceSchema} from '../validations/Maintenance.js';

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), validate(maintenanceSchema), maintenanceController.createMaintenance);

router.get("/", isAuthenticated, authorizeRoles("admin"), maintenanceController.getAllMaintenances);    

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), maintenanceController.deleteMaintenance);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), validate(maintenanceSchema), maintenanceController.updateMaintenance);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), maintenanceController.getMaintenanceById);

router.patch("/:id/complete", isAuthenticated, authorizeRoles("admin"), maintenanceController.completeMaintenance);
export default router;