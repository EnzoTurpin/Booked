import express from "express";
import {
  getProfessionalSchedule,
  getMySchedule,
  updateMySchedule,
} from "../controllers/scheduleController";
import { authenticateJWT } from "../middleware/auth.middleware";
import { isProfessional } from "../middleware/roles.middleware";

const router = express.Router();

// Route pour récupérer l'emploi du temps d'un professionnel spécifique (accessible à tous)
router.get("/professional/:professionalId/schedule", getProfessionalSchedule);

// Routes protégées pour les professionnels
router.get(
  "/professional/schedule",
  authenticateJWT,
  isProfessional,
  getMySchedule
);
router.post(
  "/professional/schedule",
  authenticateJWT,
  isProfessional,
  updateMySchedule
);

export default router;
