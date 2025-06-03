import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";
import Professional from "../models/Professional";
import User from "../models/User";
import mongoose from "mongoose";

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointments for the logged-in user
export const getUserAppointments = async (req: Request, res: Response) => {
  try {
    // L'ID de l'utilisateur est attaché à l'objet req par le middleware d'authentification
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const appointments = await Appointment.find({ clientId: userId })
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId", "firstName lastName"); // Peupler seulement nom et prénom pour le pro

    res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous de l'utilisateur:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

// Get appointments by user ID
export const getAppointmentsByUserId = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ clientId: req.params.userId })
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointments by professional ID
export const getAppointmentsByProfessionalId = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await Appointment.find({
      professionalId: req.params.professionalId,
    })
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Récupérer les rendez-vous d'un professionnel pour une date donnée
export const getAppointmentsByProfessionalAndDate = async (
  req: Request,
  res: Response
) => {
  try {
    const { professionalId } = req.params;
    const { date } = req.query; // format YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: "La date est requise" });
    }
    const appointments = await Appointment.find({
      professionalId,
      date: new Date(date as string),
      status: { $nin: ["cancelled", "no-show"] },
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message:
        "Erreur lors de la récupération des rendez-vous du professionnel",
      error,
    });
  }
};

// Get appointments for the logged-in professional
export const getMyAppointmentsAsProfessional = async (
  req: Request,
  res: Response
) => {
  try {
    // L'ID de l'utilisateur professionnel est attaché à l'objet req par le middleware d'authentification
    const professionalId = (req as any).userId;

    if (!professionalId) {
      return res
        .status(401)
        .json({ message: "Professional user not authenticated" });
    }

    // Récupérer les rendez-vous pour ce professionnel
    const appointments = await Appointment.find({
      professionalId: professionalId,
    }).populate("clientId", "firstName lastName email phone"); // Peupler les informations du client

    res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du professionnel:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

// Create new appointment
export const createAppointment = async (req: Request, res: Response) => {
  console.log("createAppointment controller reached.");
  console.log("Request body in controller:", req.body);
  console.log("User info from auth middleware:", {
    userId: (req as any).userId,
    userEmail: (req as any).userEmail,
    userRole: (req as any).userRole,
  });

  try {
    const { clientId, professionalId, date, startTime, endTime, notes } =
      req.body;

    // Vérification stricte : professionalId doit être fourni
    if (!professionalId) {
      return res
        .status(400)
        .json({ message: "Le champ professionalId est obligatoire." });
    }

    // Vérification stricte : le professionnel doit exister dans la collection User et avoir le rôle 'professional'
    const professionalExists = await User.findOne({
      _id: professionalId,
      role: "professional",
      isBanned: false, // Ajouter la vérification isBanned ici aussi si nécessaire
    });
    if (!professionalExists) {
      return res
        .status(404)
        .json({ message: "Le professionnel spécifié n'existe pas." });
    }

    // Check if the appointment time is available
    const existingAppointment = await Appointment.findOne({
      professionalId,
      date: new Date(date),
      startTime,
      status: { $nin: ["cancelled", "no-show"] },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      clientId,
      professionalId,
      date,
      startTime,
      endTime,
      notes,
      status: "pending",
    });

    const savedAppointment = await newAppointment.save();

    // Populate the saved appointment with related data
    const populatedAppointment = await Appointment.findById(
      savedAppointment._id
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Accept appointment (by professional)
export const acceptAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const professionalId = (req as any).userId; // ID du professionnel authentifié

    // Trouver le rendez-vous
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    // Vérifier que le rendez-vous appartient bien à ce professionnel
    if (
      (appointment.professionalId as mongoose.Types.ObjectId).toString() !==
      professionalId
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce rendez-vous",
      });
    }

    // Mettre à jour le statut à 'confirmed'
    appointment.status = "confirmed";
    const updatedAppointment = await appointment.save();

    // Peupler le rendez-vous mis à jour pour le retourner
    const populatedAppointment = await Appointment.findById(
      updatedAppointment._id
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId", "firstName lastName"); // Peupler le pro si nécessaire

    res.status(200).json(populatedAppointment);
  } catch (error) {
    console.error("Erreur lors de l'acceptation du rendez-vous:", error);
    res.status(500).json({
      message: "Erreur lors de l'acceptation du rendez-vous",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime, notes, status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, startTime, endTime, notes, status },
      { new: true }
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      req.params.id
    );

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
