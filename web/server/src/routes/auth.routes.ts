import express from "express";
import {
  login,
  checkAuth,
  forgotPassword,
  resetPassword,
  register,
} from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = express.Router();

// POST /api/auth/register - Créer un compte
router.post("/register", register);

// POST /api/auth/login - Se connecter
router.post("/login", login);

// GET /api/auth/check - Vérifier l'état d'authentification
router.get("/check", authenticateJWT, checkAuth);

// POST /api/auth/forgot-password - Demander une réinitialisation de mot de passe
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password - Réinitialiser le mot de passe avec un token
router.post("/reset-password", resetPassword);

export default router;
