import express from "express";
import {
  createUnbanRequest,
  getAllUnbanRequests,
  approveUnbanRequest,
  rejectUnbanRequest,
} from "../controllers/unbanRequest.controller";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// POST /api/unban-requests - Créer une nouvelle demande (utilisateurs bannis)
router.post("/", createUnbanRequest);

// GET /api/unban-requests - Récupérer toutes les demandes (admin uniquement)
router.get("/", authenticateJWT, isAdmin, getAllUnbanRequests);

// POST /api/unban-requests/:id/approve - Approuver une demande (admin uniquement)
router.post("/:id/approve", authenticateJWT, isAdmin, approveUnbanRequest);

// POST /api/unban-requests/:id/reject - Rejeter une demande (admin uniquement)
router.post("/:id/reject", authenticateJWT, isAdmin, rejectUnbanRequest);

export default router;
