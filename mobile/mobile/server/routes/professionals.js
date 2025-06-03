const express = require("express");
const router = express.Router();
const { protect: authMiddleware } = require("../middlewares/authMiddleware");
const Professional = require("../models/professional");
const User = require("../models/User");
const Appointment = require("../models/appointment");
const Availability = require("../models/availability");

// Middleware pour vérifier si l'utilisateur est un professionnel
const isProfessional = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "professional") {
      return res.status(403).json({
        success: false,
        error:
          "Accès refusé. Vous devez être un professionnel pour accéder à cette ressource.",
      });
    }
    next();
  } catch (error) {
    console.error("Erreur de vérification du rôle professionnel:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la vérification des autorisations",
    });
  }
};

// Récupérer mon profil professionnel (accessible pour tout utilisateur connecté)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un professionnel
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "professional") {
      return res.status(200).json({
        success: false,
        error: "Vous n'êtes pas un professionnel",
      });
    }

    // Récupérer le profil professionnel
    const professional = await Professional.findOne({ userId: req.user.id });

    if (!professional) {
      return res.status(200).json({
        success: false,
        error: "Profil professionnel non encore créé",
      });
    }

    res.json({
      success: true,
      data: professional,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil professionnel:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération du profil",
    });
  }
});

// Récupérer le profil professionnel
router.get("/profile", authMiddleware, isProfessional, async (req, res) => {
  try {
    const professional = await Professional.findOne({ userId: req.user.id });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: "Profil professionnel non trouvé",
      });
    }

    res.json({
      success: true,
      data: professional,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil professionnel:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération du profil",
    });
  }
});

// Créer un profil professionnel
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est déjà un professionnel
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier si un profil existe déjà
    const existingProfile = await Professional.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: "Vous avez déjà un profil professionnel",
      });
    }

    // Extraire les données du corps de la requête
    const { profession, bio, location } = req.body;

    // Valider les données requises
    if (!profession || !bio || !location) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir toutes les informations requises",
      });
    }

    // Créer le profil professionnel
    const professional = new Professional({
      userId: req.user.id,
      profession,
      bio,
      location,
      services: [],
      availability: [],
      rating: 0,
      reviewCount: 0,
    });

    await professional.save();

    // Mettre à jour le rôle de l'utilisateur
    user.role = "professional";
    await user.save();

    res.status(201).json({
      success: true,
      data: professional,
    });
  } catch (error) {
    console.error("Erreur lors de la création du profil professionnel:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la création du profil",
    });
  }
});

// Récupérer les disponibilités du professionnel
router.get(
  "/availabilities",
  authMiddleware,
  isProfessional,
  async (req, res) => {
    try {
      const professional = await Professional.findOne({ userId: req.user.id });

      if (!professional) {
        return res.status(404).json({
          success: false,
          error: "Profil professionnel non trouvé",
        });
      }

      const availabilities = await Availability.find({
        professionalId: professional._id,
      });

      res.json({
        success: true,
        data: availabilities,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des disponibilités:",
        error
      );
      res.status(500).json({
        success: false,
        error: "Erreur serveur lors de la récupération des disponibilités",
      });
    }
  }
);

// Ajouter une nouvelle disponibilité
router.post(
  "/availabilities",
  authMiddleware,
  isProfessional,
  async (req, res) => {
    try {
      const { date, time, available } = req.body;

      if (!date || !time) {
        return res.status(400).json({
          success: false,
          error: "La date et l'heure sont requises",
        });
      }

      const professional = await Professional.findOne({ userId: req.user.id });

      if (!professional) {
        return res.status(404).json({
          success: false,
          error: "Profil professionnel non trouvé",
        });
      }

      // Vérifier si une disponibilité existe déjà pour cette date
      let availability = await Availability.findOne({
        professionalId: professional._id,
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
          professionalId: professional._id,
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
        data: {
          availability,
          slot: availability.slots[availability.slots.length - 1],
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une disponibilité:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur lors de l'ajout d'une disponibilité",
      });
    }
  }
);

// Mettre à jour une disponibilité
router.put(
  "/availabilities/:availabilityId/slot/:slotId",
  authMiddleware,
  isProfessional,
  async (req, res) => {
    try {
      const { availabilityId, slotId } = req.params;
      const { available } = req.body;

      if (available === undefined) {
        return res.status(400).json({
          success: false,
          error: "La disponibilité est requise",
        });
      }

      const professional = await Professional.findOne({ userId: req.user.id });

      if (!professional) {
        return res.status(404).json({
          success: false,
          error: "Profil professionnel non trouvé",
        });
      }

      // Vérifier si la disponibilité existe
      const availability = await Availability.findOne({
        _id: availabilityId,
        professionalId: professional._id,
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

// Récupérer les rendez-vous du professionnel
router.get(
  "/appointments",
  authMiddleware,
  isProfessional,
  async (req, res) => {
    try {
      const professional = await Professional.findOne({ userId: req.user.id });

      if (!professional) {
        return res.status(404).json({
          success: false,
          error: "Profil professionnel non trouvé",
        });
      }

      const appointments = await Appointment.find({
        professionalId: professional._id,
      })
        .populate({
          path: "clientId",
          select: "firstName lastName email",
        })
        .populate({
          path: "serviceId",
          select: "name price",
        })
        .sort({ date: 1, time: 1 });

      // Formater les rendez-vous pour le front-end
      const formattedAppointments = appointments.map((appointment) => ({
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        status: appointment.status,
        client: {
          _id: appointment.clientId._id,
          firstName: appointment.clientId.firstName,
          lastName: appointment.clientId.lastName,
          email: appointment.clientId.email,
        },
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
        error: "Erreur serveur lors de la récupération des rendez-vous",
      });
    }
  }
);

module.exports = router;
