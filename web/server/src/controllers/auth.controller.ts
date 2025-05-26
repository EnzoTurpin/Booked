import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailService from "../services/email.service";

// Secret pour le JWT
const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète_jwt"; // À mettre dans un .env en production

// Fonction de connexion pour les utilisateurs
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email existe
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message:
          "Veuillez vérifier votre adresse email avant de vous connecter",
        needsVerification: true,
        email: user.email,
      });
    }

    // Vérifier si l'utilisateur est banni
    if (user.isBanned) {
      return res.status(403).json({
        message:
          "Votre compte a été suspendu. Veuillez contacter l'administration pour plus d'informations.",
        isBanned: true,
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Envoyer la réponse avec le token et les informations utilisateur (sans mot de passe)
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    };

    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Fonction pour vérifier l'état d'authentification actuel (avec un token)
export const checkAuth = async (req: Request, res: Response) => {
  try {
    // Récupérer le token depuis l'en-tête de la requête
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Aucun token fourni" });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Renvoyer les informations utilisateur
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Générer un token pour la réinitialisation de mot de passe
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Aucun compte associé à cet email n'a été trouvé",
      });
    }

    // Générer un token aléatoire
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Définir le délai d'expiration à 1 heure
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    // Sauvegarder le token dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiration;
    await user.save();

    // Créer le lien de réinitialisation
    const resetLink = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // Envoyer l'email avec le lien de réinitialisation
    await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetLink
    );

    res.status(200).json({
      message:
        "Un email contenant les instructions pour réinitialiser votre mot de passe vous a été envoyé",
    });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la demande de réinitialisation",
    });
  }
};

// Réinitialiser le mot de passe avec un token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        message: "Tous les champs sont requis",
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Le lien de réinitialisation est invalide ou a expiré",
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;

    // Effacer les champs de réinitialisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Votre mot de passe a été réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la réinitialisation du mot de passe",
    });
  }
};

// Changer le mot de passe (utilisateur connecté)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).userId; // Récupéré via le middleware d'authentification

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Le mot de passe actuel et le nouveau mot de passe sont requis",
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Le mot de passe actuel est incorrect",
      });
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Votre mot de passe a été modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du changement de mot de passe",
    });
  }
};

// Fonction d'inscription pour les nouveaux utilisateurs
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà",
      });
    }

    // Créer un nouveau token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Créer le nouvel utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      verificationToken,
      isEmailVerified: false,
    });

    // Sauvegarder l'utilisateur
    await user.save();

    // Créer le lien de vérification
    const verificationLink = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // Envoyer l'email de vérification
    await emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationLink
    );

    res.status(201).json({
      message:
        "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création du compte",
    });
  }
};
