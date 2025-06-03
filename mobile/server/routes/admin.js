const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/appointment");
const { protect, admin } = require("../middlewares/authMiddleware");

// Route pour récupérer les statistiques du tableau de bord admin
// GET /api/admin/stats
router.get("/stats", protect, admin, async (req, res) => {
  try {
    // Compter le nombre total d'utilisateurs
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // Compter le nombre de professionnels
    const totalProfessionals = await User.countDocuments({
      role: { $in: ["professional", "professionnal"] },
    });

    // Compter le nombre total de rendez-vous
    const totalAppointments = await Appointment.countDocuments();

    // Compter le nombre de rendez-vous en attente
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProfessionals,
        totalAppointments,
        pendingAppointments,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des statistiques",
    });
  }
});

module.exports = router;
