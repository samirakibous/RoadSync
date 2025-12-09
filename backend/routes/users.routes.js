import express from "express";
import { createDriver } from "../controllers/userController.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";

const router = express.Router();

router.post(
  "/drivers",
  isAuthenticated, 
  authorizeRoles("admin"), 
  createDriver            
);

export default router;
