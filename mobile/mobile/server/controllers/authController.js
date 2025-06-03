const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const VerificationToken = require("../models/verificationtoken");
const nodemailer = require("nodemailer");

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Fonction pour envoyer un email de vérification
const sendVerificationEmail = async (to, code) => {
  try {
    console.log(`======= CODE DE VÉRIFICATION =======`);
    console.log(`Email: ${to}`);
    console.log(`Code: ${code}`);
    console.log(`====================================`);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Vérification de votre compte Booked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #5D4037; text-align: center;">Bienvenue sur Booked!</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
          <div style="background-color: #A8B9A3; color: #fff; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Ce code est valable pendant 24 heures.</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">À bientôt sur Booked !</p>
        </div>
      `,
    };

    // Envoyer l'email quel que soit l'environnement
    await transporter.sendMail(mailOptions);
    console.log(`Email de vérification envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    // En développement, on considère l'email comme envoyé malgré l'erreur
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Mode développement: l'email est considéré comme envoyé malgré l'erreur"
      );
      return true;
    }
    return false;
  }
};

// Générer un code de vérification à 6 chiffres
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log("Données reçues pour l'inscription:", req.body);

    const { firstName, lastName, email, password } = req.body;

    // Validation des champs
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error:
          "Tous les champs sont requis (firstName, lastName, email, password)",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, error: "Email déjà utilisé" });
    }

    // Générer un code de vérification
    const verificationCode = generateVerificationCode();
    console.log(`Code de vérification pour ${email}: ${verificationCode}`);

    // Définir la date d'expiration (24 heures)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create user
    const user = await User.createWithDefaults({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: expiresAt,
      isActive: true,
      isApproved: req.body.role === "professional" ? false : true,
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verificationCode);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Don't return password in response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      phone: user.phone || "",
      createdAt: user.createdAt,
      isBanned: user.isBanned,
      hasUnbanRequest: user.hasUnbanRequest,
      unbanRequestDate: user.unbanRequestDate,
      isActive: user.isActive,
      isApproved: user.isApproved,
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      needsVerification: true,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le mot de passe existe
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: "Compte incomplet. Veuillez réinitialiser votre mot de passe.",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      // Vérifier si le token de vérification a expiré
      if (
        !user.emailVerificationToken ||
        !user.emailVerificationExpires ||
        user.emailVerificationExpires < new Date()
      ) {
        // Générer un nouveau code
        const newCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Mettre à jour le token de vérification
        user.emailVerificationToken = newCode;
        user.emailVerificationExpires = expiresAt;
        await user.save();

        // Envoyer le nouveau code par email
        await sendVerificationEmail(user.email, newCode);
      }

      return res.status(200).json({
        success: true,
        needsVerification: true,
        email: user.email,
        message: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Don't return password in response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      phone: user.phone || "",
      createdAt: user.createdAt,
      isBanned: user.isBanned,
      hasUnbanRequest: user.hasUnbanRequest,
      unbanRequestDate: user.unbanRequestDate,
      isActive: user.isActive,
      isApproved: user.isApproved,
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({
      email,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Code de vérification invalide ou expiré",
      });
    }

    // Mettre à jour l'état de vérification de l'utilisateur
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate token for authentication
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Don't return password in response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
      phone: user.phone || "",
      createdAt: user.createdAt,
      isBanned: user.isBanned,
      hasUnbanRequest: user.hasUnbanRequest,
      unbanRequestDate: user.unbanRequestDate,
      isActive: user.isActive,
      isApproved: user.isApproved,
    };

    res.status(200).json({
      success: true,
      message: "Email vérifié avec succès",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Si l'email est déjà vérifié
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Cet email est déjà vérifié",
      });
    }

    // Supprimer les anciens tokens de vérification pour cet utilisateur
    // Générer un nouveau code
    const newCode = generateVerificationCode();
    console.log(`Nouveau code de vérification pour ${email}: ${newCode}`);

    // Définir la date d'expiration (24 heures)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Mettre à jour le token de vérification
    user.emailVerificationToken = newCode;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    // Envoyer le nouveau code par email
    await sendVerificationEmail(email, newCode);

    res.status(200).json({
      success: true,
      message:
        "Un nouveau code de vérification a été envoyé à votre adresse email",
    });
  } catch (error) {
    console.error("Erreur lors du renvoi du code de vérification:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    console.log(
      `[DEBUG] getMe: Récupération de l'utilisateur avec ID ${req.user.id}`
    );
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      console.log(
        `[DEBUG] getMe: Utilisateur non trouvé avec ID ${req.user.id}`
      );
      return res
        .status(404)
        .json({ success: false, error: "Utilisateur non trouvé" });
    }

    console.log(
      `[DEBUG] getMe: Utilisateur trouvé ${user.email}, rôle: ${user.role}`
    );
    console.log(
      `[DEBUG] getMe: isApproved=${user.isApproved}, isActive=${user.isActive}`
    );
    console.log(
      `[DEBUG] getMe: Types - isApproved: ${typeof user.isApproved}, isActive: ${typeof user.isActive}`
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Erreur dans getMe:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check if email exists
exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "L'email est requis",
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });

    return res.status(200).json({
      success: true,
      exists: !!user, // Convertir en booléen
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
