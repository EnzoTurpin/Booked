import { Request, Response } from "express";
import WorkingHours from "../models/WorkingHours";
import Appointment from "../models/Appointment";
import User from "../models/User";

// Récupérer les rendez-vous du professionnel connecté
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const professionalId = (req as any).userId;
    const appointments = await Appointment.find({ professionalId })
      .populate("clientId", "firstName lastName email")
      .sort({ date: 1, startTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous",
      error,
    });
  }
};

// Accepter ou refuser un rendez-vous
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const professionalId = (req as any).userId;
    const { id } = req.params;
    const { status } = req.body; // "scheduled" (accepter) ou "cancelled" (refuser)

    const appointment = await Appointment.findOne({ _id: id, professionalId });
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    appointment.status = status;
    await appointment.save();
    res.json({
      message: `Rendez-vous ${status === "scheduled" ? "accepté" : "refusé"}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du rendez-vous", error });
  }
};

// Récupérer les horaires de travail du professionnel
export const getWorkingHours = async (req: Request, res: Response) => {
  try {
    const professionalId = (req as any).userId;
    const workingHours = await WorkingHours.find({ professionalId });
    res.json(workingHours);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des horaires", error });
  }
};

// Mettre à jour les horaires de travail du professionnel
export const updateWorkingHours = async (req: Request, res: Response) => {
  try {
    const professionalId = (req as any).userId;
    const { day, startTime, endTime, isWorking } = req.body;
    const wh = await WorkingHours.findOneAndUpdate(
      { professionalId, day },
      { startTime, endTime, isWorking },
      { upsert: true, new: true }
    );
    res.json(wh);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour des horaires", error });
  }
};

// Récupérer les horaires d'un professionnel pour un jour donné
export const getWorkingHoursForDay = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { day, date } = req.query; // day = 0 (dimanche) à 6 (samedi), date = YYYY-MM-DD

    if (typeof day === "undefined" || typeof date === "undefined") {
      return res
        .status(400)
        .json({ message: "Le jour (day) et la date sont requis" });
    }

    const professionalId = id; // Utiliser l'id du professionnel depuis les params
    const targetDate = new Date(date as string);

    // Récupérer les horaires de travail pour le jour spécifié
    const wh = await WorkingHours.findOne({
      professionalId: professionalId,
      day: Number(day),
    });

    if (!wh || !wh.isWorking) {
      // Si le professionnel ne travaille pas ce jour-là
      return res.status(200).json({ isOpen: false, appointments: [] });
    }

    // Récupérer les rendez-vous pris pour ce professionnel à cette date
    const appointments = await Appointment.find({
      professionalId: professionalId,
      date: targetDate,
      status: { $nin: ["cancelled", "no-show"] }, // Exclure les rendez-vous annulés ou non présentés
    }).select("startTime endTime status"); // Sélectionner seulement les champs nécessaires

    res.status(200).json({
      isOpen: true,
      start: wh.startTime,
      end: wh.endTime,
      appointments: appointments,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires et rendez-vous du jour:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des horaires du jour",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
