import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import emailService from "../services/email.service";
import {
  getProfileImageUrl,
  deleteProfileImage,
} from "../middleware/upload.middleware";
import Professional from "../models/Professional";
import mongoose from "mongoose";

interface UserObject {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  [key: string]: any;
}

interface ProfessionalObject {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  profession?: string;
  bio?: string;
}

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log("🔄 [USER CTRL] Début de création d'utilisateur");

    const { firstName, lastName, email, password, phoneNumber, role } =
      req.body;

    console.log(
      `📝 [USER CTRL] Données reçues: ${firstName} ${lastName}, ${email}, rôle: ${role}`
    );

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ [USER CTRL] Utilisateur existant: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    console.log(
      `🔑 [USER CTRL] Code de vérification généré: ${verificationCode}`
    );

    // Date d'expiration du code (24 heures)
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone: phoneNumber,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    console.log(
      `💾 [USER CTRL] Sauvegarde de l'utilisateur dans la base de données`
    );
    const savedUser = await newUser.save();
    console.log(
      `✅ [USER CTRL] Utilisateur sauvegardé avec ID: ${savedUser._id}`
    );

    // Envoyer l'email de vérification
    console.log(`📧 [USER CTRL] Tentative d'envoi d'email à ${email}`);
    try {
      const emailResult = await emailService.sendVerificationEmail(
        email,
        verificationCode,
        firstName
      );

      console.log(
        `📧 [USER CTRL] Résultat de l'envoi d'email:`,
        emailResult ? "succès" : "échec"
      );
    } catch (emailError) {
      console.error(
        `❌ [USER CTRL] Erreur lors de l'envoi de l'email:`,
        emailError
      );
      // Nous continuons même si l'email échoue
    }

    // Remove password from response by creating a new object
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      isEmailVerified: savedUser.isEmailVerified,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    console.log(
      `🏁 [USER CTRL] Fin de création d'utilisateur, envoi de la réponse`
    );
    res.status(201).json({
      user: userResponse,
      message: "Un code de vérification a été envoyé à votre adresse email",
    });
  } catch (error) {
    console.error(`❌ [USER CTRL] Erreur globale:`, error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const authenticatedUserId = (req as any).userId;

    // Vérifier que l'utilisateur ne modifie que son propre profil
    if (userId !== authenticatedUserId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce profil",
      });
    }

    const { firstName, lastName, phoneNumber, profileImageUrl } = req.body;

    // Trouver l'utilisateur actuel pour récupérer l'ancienne image si nécessaire
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Préparation des données de mise à jour
    const updateData: any = {
      firstName,
      lastName,
      phone: phoneNumber,
    };

    // Gestion de l'image de profil
    if (req.file) {
      // Nouvelle image uploadée
      const newProfileImage = getProfileImageUrl(req.file.filename);
      updateData.profileImage = newProfileImage;

      // Supprimer l'ancienne image si elle existe
      if (currentUser.profileImage) {
        try {
          const oldImageFilename = currentUser.profileImage.split("/").pop();
          if (oldImageFilename) {
            await deleteProfileImage(oldImageFilename);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'ancienne image:",
            error
          );
          // On continue même si la suppression échoue
        }
      }
    } else if (profileImageUrl === null) {
      // L'utilisateur veut supprimer son image de profil
      updateData.profileImage = null;

      // Supprimer l'ancienne image si elle existe
      if (currentUser.profileImage) {
        try {
          const oldImageFilename = currentUser.profileImage.split("/").pop();
          if (oldImageFilename) {
            await deleteProfileImage(oldImageFilename);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression de l'image:", error);
        }
      }
    }
    // Si profileImageUrl n'est pas fourni ou vaut l'URL actuelle, on ne touche pas à l'image

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify email with verification code
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Code de vérification invalide ou expiré",
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email vérifié avec succès",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Resend verification code
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Cet email est déjà vérifié" });
    }

    // Générer un nouveau code de vérification
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Date d'expiration du code (24 heures)
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Mettre à jour l'utilisateur avec le nouveau code
    user.emailVerificationToken = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Envoyer l'email de vérification
    await emailService.sendVerificationEmail(
      email,
      verificationCode,
      user.firstName
    );

    res.status(200).json({
      message:
        "Un nouveau code de vérification a été envoyé à votre adresse email",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin Routes

// Get all users - Admin only
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Ban user - Admin only
export const banUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Don't allow banning admins
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Impossible de bannir un administrateur" });
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json({ message: "Utilisateur banni avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Unban user - Admin only
export const unbanUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json({ message: "Utilisateur débanni avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user by admin - Admin only
export const adminUpdateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, role } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Prevent changing own role if admin (for security)
    const adminId = (req as any).userId;
    if (userId === adminId && role && role !== user.role) {
      return res.status(403).json({
        message: "Vous ne pouvez pas changer votre propre rôle",
      });
    }

    // Update fields
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Récupérer tous les professionnels
export const getProfessionals = async (req: Request, res: Response) => {
  try {
    console.log(
      "🔄 [USER CTRL] Début de récupération des professionnels (depuis User collection)"
    );

    // Récupérer les utilisateurs marqués comme professionnels et non bannis
    // et sélectionner uniquement les champs nécessaires pour le sélecteur (ID, prénom, nom)
    const professionals = await User.find({
      role: "professional",
      isBanned: false,
    })
      .select("_id firstName lastName") // Sélectionner les champs nécessaires de l'utilisateur
      .sort({ lastName: 1, firstName: 1 }); // Trier par nom puis prénom

    console.log(
      `✅ [USER CTRL] ${professionals.length} professionnels trouvés (depuis User collection)`
    );
    // Les utilisateurs professionnels sont déjà le résultat final si le profil est dans User
    res.json(professionals);
  } catch (error) {
    console.error(
      "❌ [USER CTRL] Erreur lors de la récupération des professionnels:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des professionnels",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
