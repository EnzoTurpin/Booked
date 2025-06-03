const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");
const Availability = require("../models/availability");
const { protect } = require("../middlewares/authMiddleware");

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

// GET appointments for the currently logged in user
router.get("/my-appointments", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié. Veuillez vous reconnecter.",
      });
    }

    const userId = req.user.id;

    const appointments = await Appointment.find({ userId })
      .populate("serviceId")
      .populate("professionalId");

    // Formater les rendez-vous pour le front-end
    const formattedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration || 30,
      status: appointment.status,
      professional: appointment.professionalId
        ? {
            _id: appointment.professionalId._id,
            firstName: appointment.professionalId.firstName,
            lastName: appointment.professionalId.lastName,
            email: appointment.professionalId.email,
            profession: appointment.professionalId.profession || "",
          }
        : null,
      serviceName: appointment.serviceId
        ? appointment.serviceId.name
        : undefined,
    }));

    res.json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de vos rendez-vous",
    });
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
router.post("/", protect, async (req, res) => {
  try {
    const { professionalId, date, time, status } = req.body;
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté

    if (!professionalId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "L'ID du professionnel, la date et l'heure sont requis",
      });
    }

    // Check if the slot is available
    const dateString = date; // Format: 'YYYY-MM-DD'
    let availability = await Availability.findOne({
      professionalId: professionalId,
      date: dateString,
    });

    // Si aucune disponibilité n'existe pour cette date, en créer une avec le créneau demandé
    if (!availability) {
      availability = new Availability({
        professionalId,
        date: dateString,
        slots: [
          {
            time,
            available: true,
          },
        ],
      });
      await availability.save();
      console.log(
        `Nouvelle disponibilité créée pour ${professionalId} le ${dateString}`
      );
    } else {
      // Find the specific time slot
      let timeSlot = availability.slots.find((slot) => slot.time === time);

      // Si le créneau n'existe pas, l'ajouter
      if (!timeSlot) {
        availability.slots.push({
          time,
          available: true,
        });
        await availability.save();
        console.log(
          `Nouveau créneau ${time} ajouté pour ${professionalId} le ${dateString}`
        );
        // Récupérer le créneau qui vient d'être ajouté
        timeSlot = availability.slots.find((slot) => slot.time === time);
      } else if (!timeSlot.available) {
        // Si le créneau existe mais n'est pas disponible
        return res.status(400).json({
          success: false,
          message: "Ce créneau horaire n'est pas disponible",
        });
      }
    }

    // Create the appointment
    const appointment = new Appointment({
      userId,
      professionalId,
      date: dateString,
      time,
      status: status || "pending",
      // Default 30 minute duration for now, can be made configurable later
      duration: 30,
    });

    // Save the appointment
    const savedAppointment = await appointment.save();

    // Marquer le créneau comme indisponible après réservation
    const updatedAvailability = await Availability.findOne({
      professionalId,
      date: dateString,
    });

    const timeSlot = updatedAvailability.slots.find(
      (slot) => slot.time === time
    );
    if (timeSlot) {
      timeSlot.available = false;
      await updatedAvailability.save();
      console.log(
        `Créneau ${time} marqué comme indisponible pour ${professionalId} le ${dateString}`
      );
    } else {
      console.log(
        `Créneau ${time} non trouvé dans la disponibilité de ${professionalId} le ${dateString}`
      );
    }

    res.status(201).json({
      success: true,
      data: savedAppointment,
      message: "Rendez-vous créé avec succès",
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

// GET résumé des rendez-vous pour un professionnel
router.get("/professional/:professionalId/summary", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      professionalId: req.params.professionalId,
    });

    // Compter les rendez-vous par statut
    const summary = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    };

    res.json(summary);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du résumé des rendez-vous:",
      error
    );
    res.status(500).json({ message: error.message });
  }
});

// GET rendez-vous pour un professionnel à une date spécifique
router.get("/professional/:professionalId/date/:date", async (req, res) => {
  try {
    const { professionalId, date } = req.params;

    const appointments = await Appointment.find({
      professionalId,
      date,
      status: { $in: ["pending", "confirmed"] }, // Seulement les rendez-vous en attente ou confirmés
    })
      .populate("userId", "firstName lastName email")
      .populate("serviceId");

    // Formater les rendez-vous pour le front-end
    const formattedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time || "00:00",
      duration: appointment.duration || 30,
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
    console.error(
      "Erreur lors de la récupération des rendez-vous du jour:",
      error
    );
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
