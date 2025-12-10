import express from "express";
import * as userController  from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";

const router = express.Router();

router.post(
  "/drivers",
  isAuthenticated, 
  authorizeRoles("admin"), 
  userController.createDriver            
);
router.patch("/update-password", isAuthenticated, userController.updatePassword);

export default router;
