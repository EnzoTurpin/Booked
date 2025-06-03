// Script pour forcer l'ajout des champs manquants directement via MongoDB
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
      // Accéder directement à la collection users pour éviter le middleware de Mongoose
      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");

      // Trouver tous les documents utilisateurs
      const users = await usersCollection.find({}).toArray();
      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);

      // Mettre à jour chaque utilisateur
      let updatedCount = 0;

      for (const user of users) {
        const updates = {};

        // Forcer l'ajout des champs manquants
        if (!user.hasOwnProperty("isActive")) {
          updates.isActive = true;
        }

        if (!user.hasOwnProperty("isApproved")) {
          // Les professionnels doivent être approuvés manuellement
          updates.isApproved =
            user.role === "professional" || user.role === "professionnal"
              ? false // Professionnels démarrent non approuvés
              : true; // Autres utilisateurs sont approuvés par défaut
        }

        if (Object.keys(updates).length > 0) {
          const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: updates }
          );

          if (result.modifiedCount > 0) {
            updatedCount++;
            console.log(`Utilisateur mis à jour: ${user.email}`);
            console.log(`Champs ajoutés: ${Object.keys(updates).join(", ")}`);
          }
        }
      }

      console.log(`\nTotal des utilisateurs mis à jour: ${updatedCount}`);

      // Vérifier un utilisateur spécifique
      if (process.argv[2]) {
        const userEmail = process.argv[2];
        const updatedUser = await usersCollection.findOne({ email: userEmail });

        if (updatedUser) {
          console.log(`\nVérification de l'utilisateur: ${updatedUser.email}`);
          console.log(
            `isActive présent: ${updatedUser.hasOwnProperty("isActive")}`
          );
          console.log(`isActive valeur: ${updatedUser.isActive}`);
          console.log(
            `isApproved présent: ${updatedUser.hasOwnProperty("isApproved")}`
          );
          console.log(`isApproved valeur: ${updatedUser.isApproved}`);
          console.log(`ID: ${updatedUser._id}`);
          console.log("\nTous les champs disponibles:");
          Object.keys(updatedUser).forEach((key) => {
            if (key !== "password") {
              console.log(`${key}: ${updatedUser[key]}`);
            }
          });
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
