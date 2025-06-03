import { Request, Response } from "express";
import { ProfessionalSchedule, Professional } from "../models";
import mongoose from "mongoose";

/**
 * Récupère l'emploi du temps hebdomadaire d'un professionnel
 */
export const getProfessionalSchedule = async (req: Request, res: Response) => {
  try {
    const professionalId = req.params.professionalId;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({
        success: false,
        message: "ID de professionnel invalide",
      });
    }

    // Récupérer l'emploi du temps du professionnel
    let schedule = await ProfessionalSchedule.findOne({ professionalId });

    // Si aucun emploi du temps n'existe, créer un emploi du temps par défaut
    if (!schedule) {
      schedule = await ProfessionalSchedule.create({
        professionalId,
        // Les valeurs par défaut seront utilisées automatiquement
      });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'emploi du temps:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'emploi du temps",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Récupère l'emploi du temps hebdomadaire du professionnel connecté
 */
export const getMySchedule = async (req: Request, res: Response) => {
  try {
    // Récupérer l'ID utilisateur depuis la requête (placé par le middleware d'authentification)
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }

    // Récupérer l'ID du professionnel à partir de l'ID utilisateur
    const professional = await Professional.findOne({ userId });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: "Profil professionnel non trouvé",
      });
    }

    const professionalId = professional._id;

    // Récupérer l'emploi du temps du professionnel
    let schedule = await ProfessionalSchedule.findOne({ professionalId });

    // Si aucun emploi du temps n'existe, créer un emploi du temps par défaut
    if (!schedule) {
      schedule = await ProfessionalSchedule.create({
        professionalId,
        // Les valeurs par défaut seront utilisées automatiquement
      });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'emploi du temps:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'emploi du temps",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Met à jour l'emploi du temps hebdomadaire du professionnel connecté
 */
export const updateMySchedule = async (req: Request, res: Response) => {
  try {
    // Récupérer l'ID utilisateur depuis la requête (placé par le middleware d'authentification)
    const userId = (req as any).userId;
    const { schedule } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }

    // Récupérer l'ID du professionnel à partir de l'ID utilisateur
    const professional = await Professional.findOne({ userId });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: "Profil professionnel non trouvé",
      });
    }

    const professionalId = professional._id;

    // Vérifier si un emploi du temps existe déjà
    let existingSchedule = await ProfessionalSchedule.findOne({
      professionalId,
    });

    // Mettre à jour ou créer l'emploi du temps
    if (existingSchedule) {
      existingSchedule = await ProfessionalSchedule.findOneAndUpdate(
        { professionalId },
        {
          monday: schedule.monday || existingSchedule.monday,
          tuesday: schedule.tuesday || existingSchedule.tuesday,
          wednesday: schedule.wednesday || existingSchedule.wednesday,
          thursday: schedule.thursday || existingSchedule.thursday,
          friday: schedule.friday || existingSchedule.friday,
          saturday: schedule.saturday || existingSchedule.saturday,
          sunday: schedule.sunday || existingSchedule.sunday,
        },
        { new: true }
      );
    } else {
      existingSchedule = await ProfessionalSchedule.create({
        professionalId,
        ...schedule,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emploi du temps mis à jour avec succès",
      schedule: existingSchedule,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emploi du temps:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'emploi du temps",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
