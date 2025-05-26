const express = require("express");
const router = express.Router();
const { protect: authMiddleware } = require("../middlewares/authMiddleware");
const Availability = require("../models/availability");
const User = require("../models/user");

// Récupérer les disponibilités d'un professionnel par son ID
router.get("/:professionalId", async (req, res) => {
  try {
    const professionalId = req.params.professionalId;

    // Vérifier si le professionnel existe
    const professional = await User.findOne({
      _id: professionalId,
      role: "professional",
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: "Professionnel non trouvé",
      });
    }

    // Récupérer les disponibilités
    const availabilities = await Availability.find({
      professionalId: professionalId,
    });

    res.json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des disponibilités",
    });
  }
});

// Créer des créneaux horaires par défaut pour un professionnel
router.post("/:professionalId/default", authMiddleware, async (req, res) => {
  try {
    const professionalId = req.params.professionalId;
    const { startDate, endDate, startTime, endTime, interval } = req.body;

    // Vérifier si l'utilisateur est autorisé (soit administrateur, soit le professionnel lui-même)
    if (req.user.role !== "admin" && req.user.id !== professionalId) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier ces disponibilités",
      });
    }

    // Valider les données
    if (!startDate || !endDate || !startTime || !endTime || !interval) {
      return res.status(400).json({
        success: false,
        error:
          "Tous les champs sont requis (startDate, endDate, startTime, endTime, interval)",
      });
    }

    // Préparer les dates (de startDate à endDate)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    // Générer les dates
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]); // Format YYYY-MM-DD
    }

    // Générer les créneaux horaires
    const generateTimeSlots = (start, end, intervalMinutes) => {
      const slots = [];
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      for (
        let mins = startMinutes;
        mins < endMinutes;
        mins += intervalMinutes
      ) {
        const hour = Math.floor(mins / 60);
        const minute = mins % 60;
        slots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }

      return slots;
    };

    const timeSlots = generateTimeSlots(startTime, endTime, parseInt(interval));

    // Créer ou mettre à jour les disponibilités pour chaque date
    const results = [];

    for (const date of dates) {
      // Vérifier si une disponibilité existe déjà pour cette date
      let availability = await Availability.findOne({
        professionalId,
        date,
      });

      if (!availability) {
        // Créer une nouvelle disponibilité avec tous les créneaux
        availability = new Availability({
          professionalId,
          date,
          slots: timeSlots.map((time) => ({
            time,
            available: true,
          })),
        });
      } else {
        // Ajouter les créneaux manquants à la disponibilité existante
        for (const time of timeSlots) {
          // Vérifier si le créneau existe déjà
          const slotExists = availability.slots.some(
            (slot) => slot.time === time
          );

          if (!slotExists) {
            // Ajouter le créneau s'il n'existe pas
            availability.slots.push({
              time,
              available: true,
            });
          }
        }
      }

      await availability.save();
      results.push(availability);
    }

    res.json({
      success: true,
      message: `Disponibilités créées pour ${dates.length} jours avec ${timeSlots.length} créneaux par jour`,
      data: results,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création des disponibilités par défaut:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la création des disponibilités par défaut",
    });
  }
});

// Ajouter une disponibilité pour un professionnel
router.post("/:professionalId", authMiddleware, async (req, res) => {
  try {
    const professionalId = req.params.professionalId;
    const { date, time, available } = req.body;

    // Vérifier si l'utilisateur est autorisé (soit administrateur, soit le professionnel lui-même)
    if (req.user.role !== "admin" && req.user.id !== professionalId) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier ces disponibilités",
      });
    }

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: "La date et l'heure sont requises",
      });
    }

    // Vérifier si une disponibilité existe déjà pour cette date
    let availability = await Availability.findOne({
      professionalId,
      date,
    });

    if (availability) {
      // Ajouter un nouveau créneau à une disponibilité existante
      availability.slots.push({
        time,
        available: available !== undefined ? available : true,
      });
    } else {
      // Créer une nouvelle disponibilité
      availability = new Availability({
        professionalId,
        date,
        slots: [
          {
            time,
            available: available !== undefined ? available : true,
          },
        ],
      });
    }

    await availability.save();

    res.json({
      success: true,
      availabilityId: availability._id,
      slot: availability.slots[availability.slots.length - 1],
      availability: availability,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une disponibilité:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de l'ajout d'une disponibilité",
    });
  }
});

// Mettre à jour une disponibilité
router.put(
  "/:professionalId/:availabilityId/slot/:slotId",
  authMiddleware,
  async (req, res) => {
    try {
      const { professionalId, availabilityId, slotId } = req.params;
      const { available } = req.body;

      // Vérifier si l'utilisateur est autorisé (soit administrateur, soit le professionnel lui-même)
      if (req.user.role !== "admin" && req.user.id !== professionalId) {
        return res.status(403).json({
          success: false,
          error: "Vous n'êtes pas autorisé à modifier ces disponibilités",
        });
      }

      if (available === undefined) {
        return res.status(400).json({
          success: false,
          error: "La disponibilité est requise",
        });
      }

      // Vérifier si la disponibilité existe
      const availability = await Availability.findOne({
        _id: availabilityId,
        professionalId: professionalId,
      });

      if (!availability) {
        return res.status(404).json({
          success: false,
          error: "Disponibilité non trouvée",
        });
      }

      // Trouver et mettre à jour le créneau
      const slotIndex = availability.slots.findIndex(
        (slot) => slot._id.toString() === slotId
      );

      if (slotIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "Créneau horaire non trouvé",
        });
      }

      availability.slots[slotIndex].available = available;
      await availability.save();

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour d'une disponibilité:",
        error
      );
      res.status(500).json({
        success: false,
        error: "Erreur serveur lors de la mise à jour d'une disponibilité",
      });
    }
  }
);

module.exports = router;
