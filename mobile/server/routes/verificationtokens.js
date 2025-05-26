const express = require("express");
const router = express.Router();
const VerificationToken = require("../models/verificationtoken");
const User = require("../models/user");

// Cette route devrait être protégée et accessible uniquement par les administrateurs
// GET all verification tokens
router.get("/", async (req, res) => {
  try {
    const tokens = await VerificationToken.find().populate("userId");
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tokens for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const tokens = await VerificationToken.find({
      userId: req.params.userId,
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new verification token
router.post("/", async (req, res) => {
  const verificationToken = new VerificationToken(req.body);
  try {
    const newToken = await verificationToken.save();
    res.status(201).json(newToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify a token
router.post("/verify", async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ message: "Token and userId are required" });
    }

    // Find the token in the database
    const verificationToken = await VerificationToken.findOne({
      token,
      userId,
    });

    if (!verificationToken) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await VerificationToken.findByIdAndDelete(verificationToken._id);
      return res.status(400).json({ message: "Token has expired" });
    }

    // Update user's verified status
    await User.findByIdAndUpdate(userId, { isVerified: true });

    // Delete the used token
    await VerificationToken.findByIdAndDelete(verificationToken._id);

    res.json({ message: "Email successfully verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a verification token
router.delete("/:id", async (req, res) => {
  try {
    const token = await VerificationToken.findByIdAndDelete(req.params.id);
    if (!token) {
      return res.status(404).json({ message: "Verification token not found" });
    }
    res.json({ message: "Verification token deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
