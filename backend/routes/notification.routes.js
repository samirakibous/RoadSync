import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, notificationController.getMyNotifications);
router.patch("/:id/read", isAuthenticated, notificationController.markAsRead);

export default router;