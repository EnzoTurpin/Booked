/**
 * Script d'initialisation des disponibilités pour un professionnel test
 *
 * Pour exécuter ce script, utilisez la commande:
 * node seedAvailabilities.js <professionalId>
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Availability = require("../models/availability");
const User = require("../models/User");

// Charger les variables d'environnement avec un chemin absolu
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAvailabilities = async (professionalId) => {
  try {
    // Se connecter à MongoDB
    console.log("URI MongoDB:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecté à MongoDB");

    // Vérifier si le professionnel existe
    const professional = await User.findOne({
      _id: professionalId,
      role: "professional",
    });

    if (!professional) {
      console.error(`Professionnel avec l'ID ${professionalId} non trouvé`);
      process.exit(1);
    }

    console.log(
      `Initialisation des disponibilités pour ${professional.firstName} ${professional.lastName}`
    );

    // Dates pour les prochains 7 jours
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]); // Format YYYY-MM-DD
    }

    // Créneaux horaires de 9h à 17h avec des intervalles de 30 minutes
    const timeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        timeSlots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }
    }

    // Supprimer les anciennes disponibilités pour ce professionnel
    await Availability.deleteMany({ professionalId });
    console.log(`Anciennes disponibilités supprimées`);

    // Créer de nouvelles disponibilités
    for (const date of dates) {
      const availability = new Availability({
        professionalId,
        date,
        slots: timeSlots.map((time) => ({
          time,
          available: true,
        })),
      });

      await availability.save();
      console.log(`Disponibilités créées pour ${date}`);
    }

    console.log("Initialisation terminée avec succès!");
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
};

// Vérifier si un ID de professionnel a été fourni
if (process.argv.length < 3) {
  console.error("Veuillez fournir un ID de professionnel");
  console.error("Usage: node seedAvailabilities.js <professionalId>");
  process.exit(1);
}

const professionalId = process.argv[2];
seedAvailabilities(professionalId);
