import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { authorizeRoles } from "../middleware/authorisedRole.middleware.js";

const router = express.Router();

router.get( "/my-notifications", isAuthenticated, authorizeRoles("admin"), notificationController.getMyNotifications);

router.patch("/:id/read",isAuthenticated,authorizeRoles("admin"),notificationController.markAsRead);

router.patch( "/mark-all-read", isAuthenticated, authorizeRoles("admin"), notificationController.markAllAsRead);

export default router;