// Script de maintenance pour s'assurer que tous les utilisateurs ont les champs requis
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connecté à MongoDB");

    try {
      // Accéder directement à la collection users
      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");

      // Trouver tous les utilisateurs
      const users = await usersCollection.find({}).toArray();
      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);

      let updatedCount = 0;
      let skippedCount = 0;

      // Vérifier et mettre à jour chaque utilisateur
      for (const user of users) {
        const updates = {};
        let needsUpdate = false;

        // Vérifier les champs obligatoires
        if (!user.hasOwnProperty("isActive")) {
          updates.isActive = true;
          needsUpdate = true;
        }

        if (!user.hasOwnProperty("isApproved")) {
          // Par défaut, seuls les professionnels ont besoin d'approbation
          updates.isApproved =
            user.role === "professional" || user.role === "professionnal"
              ? false // Professionnels démarrent non approuvés
              : true; // Autres utilisateurs sont approuvés par défaut
          needsUpdate = true;
        }

        if (needsUpdate) {
          const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: updates }
          );

          if (result.modifiedCount > 0) {
            updatedCount++;
            console.log(`Utilisateur mis à jour: ${user.email}`);
            console.log(`Champs ajoutés: ${Object.keys(updates).join(", ")}`);
          }
        } else {
          skippedCount++;
        }
      }

      console.log(`\n=== Rapport de maintenance ===`);
      console.log(`Total des utilisateurs: ${users.length}`);
      console.log(`Utilisateurs mis à jour: ${updatedCount}`);
      console.log(`Utilisateurs déjà à jour: ${skippedCount}`);
      console.log(`===========================`);
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
