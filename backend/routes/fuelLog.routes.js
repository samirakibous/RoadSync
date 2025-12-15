import express from "express";
import { uploadFuelLog } from "../config/multer.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import * as fuelLogController from "../controllers/fuelLog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("driver"), uploadFuelLog, fuelLogController.createFuelLog);
router.get("/my-fuel-logs", isAuthenticated, authorizeRoles("driver"), fuelLogController.getMyFuelLogs);

router.get("/", isAuthenticated, authorizeRoles("admin"), fuelLogController.getAllFuelLogs);
router.get("/trip/:id", isAuthenticated, authorizeRoles("admin"), fuelLogController.getFuelLogByTrip);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), fuelLogController.deleteFuelLog);

export default router;