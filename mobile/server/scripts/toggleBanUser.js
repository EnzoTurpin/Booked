// Script pour basculer le statut de bannissement d'un utilisateur
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Email de l'utilisateur à modifier
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Usage: node toggleBanUser.js <email>");
  process.exit(1);
}

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connecté à MongoDB");

    try {
      // Trouver l'utilisateur
      const user = await User.findOne({ email: userEmail });

      if (!user) {
        console.error(`Utilisateur avec l'email ${userEmail} non trouvé`);
        process.exit(1);
      }

      // Basculer le statut de bannissement
      const newBanStatus = !user.isBanned;
      user.isBanned = newBanStatus;

      if (newBanStatus) {
        // Si l'utilisateur est banni, réinitialiser toute demande de déban existante
        user.hasUnbanRequest = false;
        user.unbanRequestReason = "";
        user.unbanRequestDate = null;
        console.log(`L'utilisateur ${userEmail} a été BANNI avec succès!`);
      } else {
        console.log(`L'utilisateur ${userEmail} a été DÉBANNI avec succès!`);
      }

      await user.save();

      console.log("Statut actuel:", user.isBanned ? "BANNI" : "NON BANNI");
      console.log("----------------------------------");
      console.log("Email:", user.email);
      console.log("Nom:", user.firstName, user.lastName);
      console.log("Rôle:", user.role);
      console.log("----------------------------------");

      if (user.isBanned) {
        console.log(
          "Vous pouvez maintenant vous connecter avec cet utilisateur pour tester la fonctionnalité de demande de déban."
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB:", error);
  });
