const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour empêcher la mise en cache des réponses
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Import routes
const bookingRoutes = require("./routes/bookings");
const roomRoutes = require("./routes/rooms");
const userRoutes = require("./routes/users");
const serviceRoutes = require("./routes/services");
const appointmentRoutes = require("./routes/appointments");
const notificationRoutes = require("./routes/notifications");
const professionalRoutes = require("./routes/professionals");
const reviewRoutes = require("./routes/reviews");
const unbanRequestRoutes = require("./routes/unbanrequests");
const verificationTokenRoutes = require("./routes/verificationtokens");
const authRoutes = require("./routes/auth");
const availabilityRoutes = require("./routes/availability");
const adminRoutes = require("./routes/admin");

// Use routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/unbanrequests", unbanRequestRoutes);
app.use("/api/verificationtokens", verificationTokenRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/admin", adminRoutes);

// Route simple pour vérifier si l'API est en ligne
app.get("/api/status", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Default route
app.get("/", (req, res) => {
  res.send("Booked API is running!");
});

// Test route - easily check API connectivity
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is accessible!",
    timestamp: new Date().toISOString(),
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Middleware global pour s'assurer que isActive et isApproved sont toujours définis
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Intercepter les opérations d'insertion
    const originalInsertOne = usersCollection.insertOne;
    usersCollection.insertOne = function (doc, options) {
      // S'assurer que isActive est défini
      if (doc.isActive === undefined) {
        doc.isActive = true;
      }

      // S'assurer que isApproved est défini et basé sur le rôle
      if (doc.isApproved === undefined) {
        doc.isApproved =
          doc.role === "professional" || doc.role === "professionnal"
            ? false
            : true;
      }

      return originalInsertOne.call(this, doc, options);
    };

    // Start server after successful DB connection
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server accessible at http://localhost:${PORT}`);
      console.log(
        `For mobile devices, connect to your computer's IP address:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

module.exports = app;
