import express from "express";
import * as serviceController from "../controllers/service.controller";

const router = express.Router();

// GET /api/services - Get all services
router.get("/", serviceController.getServices);

// GET /api/services/:id - Get service by ID
router.get("/:id", serviceController.getServiceById);

// GET /api/services/professional/:professionalId - Get services by professional ID
router.get(
  "/professional/:professionalId",
  serviceController.getServicesByProfessional
);

// POST /api/services - Create new service
router.post("/", serviceController.createService);

// PUT /api/services/:id - Update service
router.put("/:id", serviceController.updateService);

// DELETE /api/services/:id - Delete service
router.delete("/:id", serviceController.deleteService);

export default router;
