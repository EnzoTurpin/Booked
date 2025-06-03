import { Request, Response } from "express";
import nodemailer from "nodemailer";

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "dev.booked@gmail.com",
    pass: process.env.EMAIL_PASS || "", // Utiliser un mot de passe d'application de Gmail
  },
});

// Envoyer un message de contact
export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Valider les données reçues
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Veuillez remplir tous les champs requis",
      });
    }

    // Préparer l'objet email
    const mailOptions = {
      from: `"Formulaire de Contact Booked" <${
        process.env.EMAIL_USER || "dev.booked@gmail.com"
      }>`,
      to: "dev.booked@gmail.com",
      subject: `[Contact Booked] ${subject}`,
      html: `
        <h2>Nouveau message de contact sur Booked</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: email,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Répondre au client
    res.status(200).json({
      success: true,
      message: "Votre message a été envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'envoi du message",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
