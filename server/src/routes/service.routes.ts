import express from "express";
import {
  getServices,
  getServiceById,
  getServicesWithProfessionalDetails,
  getServicesByCategory,
  getServicesByProfessional,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller";

const router = express.Router();

// Routes publiques
router.get("/", getServices);
router.get("/details", getServicesWithProfessionalDetails);
router.get("/category/:category", getServicesByCategory);
router.get("/professional/:professionalId", getServicesByProfessional);
router.get("/:id", getServiceById);

// Routes protégées (ajoutez middleware d'authentification si nécessaire)
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
