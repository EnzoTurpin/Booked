import express from "express";
import * as appointmentController from "../controllers/appointment.controller";

const router = express.Router();

// GET /api/appointments - Get all appointments
router.get("/", appointmentController.getAppointments);

// GET /api/appointments/:id - Get appointment by ID
router.get("/:id", appointmentController.getAppointmentById);

// GET /api/appointments/user/:userId - Get appointments by user ID
router.get("/user/:userId", appointmentController.getAppointmentsByUserId);

// GET /api/appointments/professional/:professionalId - Get appointments by professional ID
router.get(
  "/professional/:professionalId",
  appointmentController.getAppointmentsByProfessionalId
);

// POST /api/appointments - Create new appointment
router.post("/", appointmentController.createAppointment);

// PATCH /api/appointments/:id/status - Update appointment status
router.patch("/:id/status", appointmentController.updateAppointmentStatus);

// PUT /api/appointments/:id - Update appointment
router.put("/:id", appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

export default router;
