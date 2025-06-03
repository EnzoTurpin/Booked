// Script pour tester la création d'un utilisateur
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config();

// Données de test pour un nouvel utilisateur
const testUserData = {
  firstName: "Test",
  lastName: "User",
  email: "testuser" + Math.floor(Math.random() * 10000) + "@example.com", // Email aléatoire pour éviter les doublons
  password: "password123",
  role: process.argv[2] || "client", // Peut être spécifié en argument (client ou professional)
};

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connecté à MongoDB");

    try {
      console.log(
        "Création d'un utilisateur de test avec les données:",
        testUserData
      );

      // Utiliser notre nouvelle méthode createWithDefaults
      const user = await User.createWithDefaults(testUserData);

      console.log("Utilisateur créé avec succès!");
      console.log("ID:", user._id);
      console.log("Email:", user.email);
      console.log("Rôle:", user.role);
      console.log("isActive:", user.isActive);
      console.log("isApproved:", user.isApproved);

      // Vérifier directement dans la base de données
      console.log("\nVérification dans la base de données:");
      const db = mongoose.connection.db;
      const savedUser = await db.collection("users").findOne({ _id: user._id });

      console.log("isActive présent:", savedUser.hasOwnProperty("isActive"));
      console.log("isActive valeur:", savedUser.isActive);
      console.log(
        "isApproved présent:",
        savedUser.hasOwnProperty("isApproved")
      );
      console.log("isApproved valeur:", savedUser.isApproved);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB:", error);
  });
