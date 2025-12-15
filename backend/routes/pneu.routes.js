import express from "express";
import * as pneuController from "../controllers/Pneu.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import { createPneuSchema, updatePneuSchema } from "../validations/Pneu.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("admin"), validate(createPneuSchema), pneuController.createPneu);

router.get("/", isAuthenticated, authorizeRoles("admin"), pneuController.getAllPneus);

router.delete("/:id", isAuthenticated, authorizeRoles("admin"), pneuController.deletePneu);

router.patch("/:id", isAuthenticated, authorizeRoles("admin"),validate(updatePneuSchema), pneuController.updatePneu);

router.get("/:id", isAuthenticated, authorizeRoles("admin"), pneuController.getPneuById);
export default router;