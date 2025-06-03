import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  getAppointments,
  updateAppointmentStatus,
  getWorkingHours,
  updateWorkingHours,
  getWorkingHoursForDay,
} from "../controllers/professional.controller";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateJWT);

// Récupérer les rendez-vous du professionnel
router.get("/appointments", getAppointments);

// Accepter/refuser un rendez-vous
router.put("/appointments/:id/status", updateAppointmentStatus);

// Récupérer les horaires de travail
router.get("/working-hours", getWorkingHours);

// Mettre à jour les horaires de travail
router.put("/working-hours", updateWorkingHours);

// Récupérer les horaires d'un professionnel pour un jour donné
router.get("/:id/working-hours", getWorkingHoursForDay);

export default router;
