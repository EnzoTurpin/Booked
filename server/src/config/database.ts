import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/reservation-system";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    // Ce message sera remplacé par celui dans index.ts

    // Log connection events
    mongoose.connection.on("error", (err) => {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `❌ Erreur de connexion MongoDB: ${err}`
      );
    });

    mongoose.connection.on("disconnected", () => {
      console.log("\x1b[33m%s\x1b[0m", "🔌 MongoDB déconnecté");
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log(
        "\x1b[36m%s\x1b[0m",
        "👋 Connexion MongoDB fermée suite à l'arrêt de l'application"
      );
      process.exit(0);
    });
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `❌ Échec de connexion à MongoDB: ${error}`
    );
    throw error; // Propagate the error to be caught in index.ts
  }
};

export default connectDB;
