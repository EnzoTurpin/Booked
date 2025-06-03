// Script pour lister tous les utilisateurs
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connecté à MongoDB");

    try {
      // Trouver tous les utilisateurs
      const users = await User.find({});

      console.log(`Nombre total d'utilisateurs: ${users.length}`);
      console.log("----------------------------------");

      users.forEach((user, index) => {
        console.log(`Utilisateur #${index + 1}:`);
        console.log(`Email: ${user.email}`);
        console.log(`Nom: ${user.firstName} ${user.lastName}`);
        console.log(`Rôle: ${user.role}`);
        console.log(`isActive: ${user.isActive}`);
        console.log(`isApproved: ${user.isApproved}`);
        console.log(`isEmailVerified: ${user.isEmailVerified}`);
        console.log(`isBanned: ${user.isBanned}`);
        console.log(`ID: ${user._id}`);
        console.log("----------------------------------");
      });
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
