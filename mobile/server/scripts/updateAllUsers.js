// Script pour mettre à jour les champs manquants pour tous les utilisateurs
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

      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);

      // Mise à jour par lots pour tous les utilisateurs
      const bulkOps = users.map((user) => {
        const updates = {};

        // Vérifier et initialiser les champs manquants
        if (user.isActive === undefined) {
          updates.isActive = true;
        }

        if (user.isApproved === undefined) {
          // Les professionnels doivent être approuvés manuellement
          updates.isApproved =
            user.role === "professional" || user.role === "professionnal"
              ? false // Professionnels démarrent non approuvés
              : true; // Autres utilisateurs sont approuvés par défaut
        }

        return {
          updateOne: {
            filter: { _id: user._id },
            update: { $set: updates },
            upsert: false,
          },
        };
      });

      if (bulkOps.length > 0) {
        const result = await User.bulkWrite(bulkOps);
        console.log(
          `Résultat de la mise à jour en lot: ${JSON.stringify(result)}`
        );
      }

      console.log("Mise à jour terminée avec succès!");

      // Vérifier un utilisateur spécifique
      if (process.argv[2]) {
        const userEmail = process.argv[2];
        const updatedUser = await User.findOne({ email: userEmail });

        if (updatedUser) {
          console.log(`\nUtilisateur mis à jour: ${updatedUser.email}`);
          console.log(`isActive: ${updatedUser.isActive}`);
          console.log(`isApproved: ${updatedUser.isApproved}`);
          console.log(`ID: ${updatedUser._id}`);
        } else {
          console.log(`\nUtilisateur ${userEmail} non trouvé`);
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
