import express from "express";
import * as trailerController from "../controllers/trailer.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import {createTrailerSchema} from "../validations/Trailer.js";
import {updateTrailerSchema} from "../validations/Trailer.js";
import {validate} from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), validate(createTrailerSchema), trailerController.createTrailer);

router.get("/", isAuthenticated, authorizeRoles("admin"), trailerController.getAllTrailers);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), trailerController.deleteTrailer);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"), validate(updateTrailerSchema), trailerController.updateTrailer);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), trailerController.getTrailerById);
export default router;