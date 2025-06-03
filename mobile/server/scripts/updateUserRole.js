// Script pour changer le rôle d'un utilisateur
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Email de l'utilisateur à modifier
const userEmail = process.argv[2];
const newRole = process.argv[3] || "professional";

if (!userEmail) {
  console.error("Usage: node updateUserRole.js <email> [newRole]");
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

      console.log("Utilisateur avant la mise à jour:");
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.firstName} ${user.lastName}`);
      console.log(`Rôle actuel: ${user.role}`);
      console.log(`isActive: ${user.isActive}`);
      console.log(`isApproved: ${user.isApproved}`);
      console.log(`ID: ${user._id}`);

      // Changer le rôle
      user.role = newRole;

      // Si l'utilisateur devient un professionnel, mettre isApproved à false
      if (newRole === "professional" || newRole === "professionnal") {
        user.isApproved = false;
      }

      await user.save();

      console.log("\nUtilisateur après la mise à jour:");
      console.log(`Nouveau rôle: ${user.role}`);
      console.log(`isActive: ${user.isActive}`);
      console.log(`isApproved: ${user.isApproved}`);
      console.log(`Mise à jour effectuée avec succès!`);
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
