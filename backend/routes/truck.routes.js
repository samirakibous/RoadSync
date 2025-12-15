import express from "express";
import * as truckController from "../controllers/Truck.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import {validate} from "../middleware/validate.middleware.js";
import {TruckSchema} from "../validations/Truck.js";
const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"),validate(TruckSchema), truckController.createTruck);

router.get("/", isAuthenticated, authorizeRoles("admin"), truckController.getAllTrucks);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), truckController.deleteTruck);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), validate(TruckSchema), truckController.updateTruck);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), truckController.getTruckById);
export default router;
