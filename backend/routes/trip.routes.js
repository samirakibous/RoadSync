import * as tripController from "../controllers/Trip.controller.js";
import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), tripController.createTrip);

router.get("/", isAuthenticated, authorizeRoles("admin"), tripController.getAllTrips);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), tripController.deleteTrip);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), tripController.updateTrip);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), tripController.getTripById);

router.patch("/:id/start", isAuthenticated, authorizeRoles("admin"), tripController.startTrip);

router.patch("/:id/end", isAuthenticated, authorizeRoles("admin"), tripController.endTrip);

router.get("/my-trips", isAuthenticated, authorizeRoles("driver"), tripController.getTripByDriver);


export default router;
