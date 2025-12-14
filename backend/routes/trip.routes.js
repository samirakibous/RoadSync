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

router.patch("/:id/start", isAuthenticated, authorizeRoles("admin", "driver"), tripController.startTrip);

router.patch("/:id/end", isAuthenticated, authorizeRoles("admin", "driver"), tripController.endTrip);

router.get("/driver/my-trips", isAuthenticated, authorizeRoles("driver"), tripController.getTripByDriver);

router.get("/:id/download-pdf", isAuthenticated, authorizeRoles("admin", "driver"), tripController.downloadTripPDF);

export default router;
