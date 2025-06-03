import { Request, Response } from "express";
import User from "../models/User";
import BanNotification from "../models/banNotification.model";
import { sendBanEmail } from "../services/email.service";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le statut de l'utilisateur
    user.isBanned = true;
    await user.save();

    // Créer une notification de ban
    const notification = new BanNotification({
      userId: user._id,
      username: `${user.firstName} ${user.lastName}`,
      reason,
      createdAt: new Date(),
    });
    await notification.save();

    // Envoyer un email à l'utilisateur
    await sendBanEmail(user.email, reason);

    res.json({ message: "Utilisateur banni avec succès" });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Erreur lors du bannissement" });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: "Utilisateur débanni avec succès" });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({ message: "Erreur lors du débannissement" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await BanNotification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des notifications" });
  }
};
