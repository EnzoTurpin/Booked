// Script pour mettre à jour les champs manquants pour les utilisateurs professionnels
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
      // Trouver tous les utilisateurs professionnels
      const professionals = await User.find({
        role: { $in: ["professional", "professionnal"] },
      });

      console.log(`Nombre de professionnels trouvés: ${professionals.length}`);

      // Mettre à jour chaque utilisateur professionnel
      for (const user of professionals) {
        const updates = {};

        // Vérifier et initialiser les champs manquants
        if (user.isActive === undefined) {
          updates.isActive = true;
        }

        if (user.isApproved === undefined) {
          updates.isApproved = false;
        }

        // Ne mettre à jour que si des champs sont manquants
        if (Object.keys(updates).length > 0) {
          const result = await User.updateOne(
            { _id: user._id },
            { $set: updates }
          );

          console.log(`Utilisateur mis à jour: ${user.email}`);
          console.log(`Champs ajoutés: ${Object.keys(updates).join(", ")}`);
          console.log(`Résultat: ${JSON.stringify(result)}`);
          console.log("-----------------------------------");
        } else {
          console.log(
            `Utilisateur ${user.email} a déjà tous les champs requis`
          );
        }
      }

      console.log("Mise à jour terminée avec succès!");
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
