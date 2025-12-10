import express from "express";
import * as trailerController from "../controllers/trailer.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), trailerController.createTrailer);

router.get("/", isAuthenticated, authorizeRoles("admin"), trailerController.getAllTrailers);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), trailerController.deleteTrailer);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), trailerController.updateTrailer);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), trailerController.getTrailerById);
export default router;