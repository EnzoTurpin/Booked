import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointment.routes";
import userRoutes from "./routes/user.routes";
import serviceRoutes from "./routes/service.routes";
import authRoutes from "./routes/auth.routes";
import connectDB from "./config/database";
import path from "path";

// Configuration
dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/booking-system";

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("\x1b[32m%s\x1b[0m", "✅ MongoDB connecté avec succès");
  })
  .catch((err: Error) => {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `❌ Erreur de connexion MongoDB: ${err.message}`
    );
  });

// Start server
app.listen(PORT, () => {
  console.log(
    "\x1b[36m%s\x1b[0m",
    `🚀 Booked API - Serveur démarré sur le port ${PORT}`
  );
  console.log(
    "\x1b[35m%s\x1b[0m",
    `📚 API Documentation: http://localhost:${PORT}/api-docs`
  );
  console.log(
    "\x1b[33m%s\x1b[0m",
    "🔥 Mode: " + (process.env.NODE_ENV || "development")
  );
  console.log(
    "\x1b[34m%s\x1b[0m",
    "⏰ Démarré le: " + new Date().toLocaleString()
  );
  console.log("\x1b[32m%s\x1b[0m", "🌐 Serveur prêt à recevoir des requêtes!");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("\x1b[31m%s\x1b[0m", `❌ Erreur non gérée: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
