import express from "express";
import * as userController  from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";
import {validate} from "../middleware/validate.middleware.js";
import {UserSchema} from "../validations/User.js"

const router = express.Router();

router.post("/drivers",isAuthenticated, authorizeRoles("admin"),validate(UserSchema) ,userController.createDriver);

router.patch("/drivers/update-password/:userId", isAuthenticated,validate(UserSchema), userController.updatePassword);

router.delete("/drivers/:userId", isAuthenticated, authorizeRoles("admin"), userController.deleteDriver);

router.get("/drivers", isAuthenticated, authorizeRoles("admin"), userController.getAllDrivers);
export default router;
