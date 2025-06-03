import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

console.log(
  "🔄 Initialisation du service d'email avec les identifiants du fichier .env"
);

// Obtenir les identifiants SMTP depuis le fichier .env
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Afficher les informations de configuration (sans le mot de passe)
console.log("📧 Configuration email:");
console.log(`- Host: ${EMAIL_HOST}`);
console.log(`- Port: ${EMAIL_PORT}`);
console.log(`- User: ${EMAIL_USER}`);
console.log(`- From: ${EMAIL_FROM}`);
console.log(`- Password configuré: ${!!EMAIL_PASS}`);

// Créer le transporteur avec les identifiants du fichier .env
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Vérifier la connexion au démarrage
(async () => {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error(
        "❌ Configuration SMTP manquante. Veuillez vérifier votre fichier .env"
      );
      return;
    }

    const verifyResult = await transporter.verify();
    console.log("✅ Connexion SMTP vérifiée avec succès", verifyResult);
  } catch (error) {
    console.error("❌ Erreur lors de la vérification SMTP:", error);
    console.error("⚠️ Vérifiez vos identifiants SMTP dans le fichier .env");
  }
})();

export const sendVerificationEmail = async (
  to: string,
  verificationCode: string,
  firstName: string
) => {
  console.log("🔄 [EMAIL SERVICE] Demande d'envoi d'email à", to);

  try {
    // Vérifier que les identifiants SMTP sont configurés
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error(
        "❌ [EMAIL SERVICE] Configuration SMTP manquante. Veuillez vérifier votre fichier .env"
      );
      return false;
    }

    console.log(
      `🔄 [EMAIL SERVICE] Envoi d'email à ${to} pour ${firstName} avec le code ${verificationCode}`
    );

    // Template de l'email
    const mailOptions = {
      from: EMAIL_FROM || '"Booked App" <noreply@booked.com>',
      to,
      subject: "Vérification de votre adresse email - Booked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">Bienvenue sur Booked, ${firstName}!</h2>
          <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 30px; letter-spacing: 5px; margin: 0; color: #4a4a4a;">${verificationCode}</h1>
          </div>
          <p>Ce code est valable pendant 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">Ceci est un email automatique, merci de ne pas y répondre.</p>
        </div>
      `,
      text: `Bienvenue sur Booked, ${firstName}! Votre code de vérification est: ${verificationCode}. Ce code est valable pendant 24 heures.`,
    };

    console.log(`📧 [EMAIL SERVICE] Options d'envoi:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ [EMAIL SERVICE] Email envoyé avec succès: ${info.messageId}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ [EMAIL SERVICE] Erreur lors de l'envoi de l'email:",
      error
    );

    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }

    return false;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  firstName: string,
  resetLink: string
) => {
  console.log(
    "🔄 [EMAIL SERVICE] Demande d'envoi d'email de réinitialisation à",
    to
  );

  try {
    // Vérifier que les identifiants SMTP sont configurés
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error(
        "❌ [EMAIL SERVICE] Configuration SMTP manquante. Veuillez vérifier votre fichier .env"
      );
      return false;
    }

    console.log(
      `🔄 [EMAIL SERVICE] Envoi d'email de réinitialisation à ${to} pour ${firstName}`
    );

    // Template de l'email
    const mailOptions = {
      from: EMAIL_FROM || '"Booked App" <noreply@booked.com>',
      to,
      subject: "Réinitialisation de votre mot de passe - Booked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">Bonjour ${firstName},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe sur Booked.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #8A9A5B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Ce lien est valable pendant 1 heure.</p>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">Ceci est un email automatique, merci de ne pas y répondre.</p>
        </div>
      `,
      text: `Bonjour ${firstName}, vous avez demandé la réinitialisation de votre mot de passe sur Booked. Utilisez ce lien pour réinitialiser votre mot de passe: ${resetLink}. Ce lien est valable pendant 1 heure.`,
    };

    console.log(`📧 [EMAIL SERVICE] Options d'envoi:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ [EMAIL SERVICE] Email de réinitialisation envoyé avec succès: ${info.messageId}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ [EMAIL SERVICE] Erreur lors de l'envoi de l'email de réinitialisation:",
      error
    );

    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }

    return false;
  }
};

export const sendBanEmail = async (userEmail: string, reason: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: userEmail,
    subject: "Votre compte a été banni",
    html: `
      <h1>Notification de bannissement</h1>
      <p>Cher utilisateur,</p>
      <p>Votre compte a été banni de notre plateforme pour la raison suivante :</p>
      <p><strong>${reason}</strong></p>
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre support.</p>
      <p>Cordialement,<br>L'équipe Booked</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending ban email:", error);
    throw new Error("Erreur lors de l'envoi de l'email de bannissement");
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBanEmail,
};
