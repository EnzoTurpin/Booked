import express from "express";
import {
  getUserAppointments,
  getAppointmentsByUserId,
  getAppointmentById,
  getAppointments,
  getAppointmentsByProfessionalId,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByProfessionalAndDate,
  getMyAppointmentsAsProfessional,
  acceptAppointment,
} from "../controllers/appointment.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = express.Router();

// GET /api/appointments/user - Get appointments for the logged-in user
router.get("/user", authenticateJWT, getUserAppointments);

// GET /api/appointments/user/:userId - Get appointments by user ID (if needed, e.g., for admin)
router.get("/user/:userId", authenticateJWT, getAppointmentsByUserId);

// GET /api/appointments/professional/me - Get appointments for the logged-in professional
router.get(
  "/professional/me",
  authenticateJWT,
  getMyAppointmentsAsProfessional
);

// GET /api/appointments/:id - Get appointment by ID
router.get("/:id", getAppointmentById);

// GET /api/appointments - Get all appointments
router.get("/", getAppointments);

// GET /api/appointments/professional/:professionalId - Get appointments by professional ID
router.get("/professional/:professionalId", getAppointmentsByProfessionalId);

// GET /api/appointments/professional/:professionalId?date=YYYY-MM-DD - Get appointments by professional ID and date
router.get(
  "/professional/:professionalId",
  getAppointmentsByProfessionalAndDate
);

// POST /api/appointments - Create new appointment
router.post("/", authenticateJWT, createAppointment);

// PATCH /api/appointments/:id/status - Update appointment status
router.patch("/status/:id", authenticateJWT, updateAppointmentStatus);

// PATCH /api/appointments/:id/accept - Accept appointment (professional only)
router.patch("/:id/accept", authenticateJWT, acceptAppointment);

// PUT /api/appointments/:id - Update appointment
router.put("/:id", updateAppointment);

// DELETE /api/appointments/:id - Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
