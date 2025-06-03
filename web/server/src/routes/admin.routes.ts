import express from "express";
import { isAdmin } from "../middleware/auth.middleware";
import {
  getUsers,
  banUser,
  unbanUser,
  getNotifications,
} from "../controllers/admin.controller";

const router = express.Router();

// Routes protégées par le middleware isAdmin
router.use(isAdmin);

// Routes pour la gestion des utilisateurs
router.get("/users", getUsers);
router.post("/ban/:userId", banUser);
router.post("/unban/:userId", unbanUser);

// Route pour les notifications
router.get("/notifications", getNotifications);

export default router;
