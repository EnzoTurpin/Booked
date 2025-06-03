// Script pour vérifier les champs d'un utilisateur spécifique
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Email de l'utilisateur à vérifier
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Usage: node checkUserFields.js <email>");
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

      console.log("Informations de l'utilisateur:");
      console.log("----------------------------------");
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.firstName} ${user.lastName}`);
      console.log(`Rôle: ${user.role}`);
      console.log(`isActive: ${user.isActive}`);
      console.log(`isApproved: ${user.isApproved}`);
      console.log(`isEmailVerified: ${user.isEmailVerified}`);
      console.log(`isBanned: ${user.isBanned}`);
      console.log("----------------------------------");

      // Afficher tous les champs disponibles
      console.log("Tous les champs disponibles:");
      const userObject = user.toObject();
      for (const [key, value] of Object.entries(userObject)) {
        if (key !== "password" && key !== "__v") {
          console.log(`${key}: ${value}`);
        }
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
