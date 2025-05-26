const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");
const Availability = require("../models/availability");

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId")
      .populate("serviceId")
      .populate("professionalId");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET appointments for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .populate("serviceId")
      .populate("professionalId");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("userId")
      .populate("serviceId")
      .populate("professionalId");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE the CREATE route to handle new format without service
router.post("/", async (req, res) => {
  try {
    const { professionalId, date, time, status } = req.body;
    const userId = req.user ? req.user.id : req.body.userId; // Get from authenticated user or body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "L'ID utilisateur est requis",
      });
    }

    if (!professionalId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "L'ID du professionnel, la date et l'heure sont requis",
      });
    }

    // Check if the slot is available
    const dateString = date; // Format: 'YYYY-MM-DD'
    const availability = await Availability.findOne({
      professionalId: professionalId,
      date: dateString,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Aucune disponibilité trouvée pour cette date",
      });
    }

    // Find the specific time slot
    const timeSlot = availability.slots.find(
      (slot) => slot.time === time && slot.available === true
    );

    if (!timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Ce créneau horaire n'est pas disponible",
      });
    }

    // Create the appointment
    const appointment = new Appointment({
      userId,
      professionalId,
      date: dateString,
      time,
      status: status || "pending",
      // Default 60 minute duration for now, can be made configurable later
      duration: 60,
    });

    // Save the appointment
    const savedAppointment = await appointment.save();

    // Mark the time slot as unavailable
    timeSlot.available = false;
    await availability.save();

    res.status(201).json({
      success: true,
      data: savedAppointment,
    });
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE an appointment
router.put("/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET rendez-vous pour un professionnel spécifique
router.get("/professional/:professionalId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      professionalId: req.params.professionalId,
    })
      .populate("userId", "firstName lastName email")
      .populate("serviceId");

    // Formater les rendez-vous pour le front-end
    const formattedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time || "00:00", // Fallback si le temps n'est pas défini
      duration: appointment.duration || 30, // Fallback si la durée n'est pas définie
      status: appointment.status,
      client: {
        _id: appointment.userId._id,
        firstName: appointment.userId.firstName,
        lastName: appointment.userId.lastName,
        email: appointment.userId.email,
      },
      serviceName: appointment.serviceId
        ? appointment.serviceId.name
        : undefined,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
