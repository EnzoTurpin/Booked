// Script pour supprimer les champs inutilisés des utilisateurs existants
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

      // Compter les utilisateurs avant le nettoyage
      const userCount = await usersCollection.countDocuments();
      console.log(`Nombre d'utilisateurs trouvés: ${userCount}`);

      // Supprimer les champs inutilisés de tous les utilisateurs
      const result = await usersCollection.updateMany(
        {}, // Tous les utilisateurs
        {
          $unset: {
            specialty: "",
            biography: "",
            services: "",
            profileImage: "",
            profession: "",
            bio: "",
          },
        }
      );

      console.log(`\n=== Résultat du nettoyage ===`);
      console.log(
        `Utilisateurs mis à jour: ${result.modifiedCount} sur ${userCount}`
      );
      console.log(`===========================`);

      // Vérifier un utilisateur aléatoire après le nettoyage
      const sampleUser = await usersCollection.findOne({});
      console.log("\nExemple d'un utilisateur après nettoyage:");
      console.log("Champs présents:", Object.keys(sampleUser).join(", "));
      console.log("specialty présent:", sampleUser.hasOwnProperty("specialty"));
      console.log("biography présent:", sampleUser.hasOwnProperty("biography"));
      console.log("services présent:", sampleUser.hasOwnProperty("services"));
    } catch (error) {
      console.error("Erreur lors du nettoyage des utilisateurs:", error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB:", error);
  });
