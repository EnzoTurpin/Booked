// Script pour bannir un utilisateur de test
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Email de l'utilisateur à bannir
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Usage: node banTestUser.js <email>");
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

      // Bannir l'utilisateur
      user.isBanned = true;
      user.hasUnbanRequest = false; // Réinitialiser toute demande de déban existante
      user.unbanRequestReason = "";
      user.unbanRequestDate = null;

      await user.save();

      console.log(`L'utilisateur ${userEmail} a été banni avec succès!`);
      console.log(
        "Vous pouvez maintenant vous connecter avec cet utilisateur pour tester la fonctionnalité de demande de déban."
      );
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
