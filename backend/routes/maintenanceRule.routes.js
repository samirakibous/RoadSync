import * as maintenanceRuleController from "../controllers/maintenanceRule.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import express from "express";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), maintenanceRuleController.createMaintenanceRule);

router.get("/", isAuthenticated, authorizeRoles("admin"), maintenanceRuleController.getAllMaintenanceRules);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), maintenanceRuleController.deleteMaintenanceRule);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), maintenanceRuleController.updateMaintenanceRule);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), maintenanceRuleController.getMaintenanceRuleById);

export default router;