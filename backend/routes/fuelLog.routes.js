import express from "express";
import { uploadFuelLog } from "../config/multer.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import * as fuelLogController from "../controllers/fuelLog.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, authorizeRoles("driver", "admin"), uploadFuelLog, fuelLogController.createFuelLog);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), fuelLogController.deleteFuelLog);

router.get("/", isAuthenticated, authorizeRoles("admin"), fuelLogController.getAllFuelLogs);
router.get('/trip/:id', isAuthenticated, authorizeRoles("admin"), fuelLogController.getFuelLogByTrip);

export default router;