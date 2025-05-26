const mongoose = require("mongoose");

const verificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "password-reset", "account-activation"],
    default: "email",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Set expiration index so tokens will automatically get deleted after expiration
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure tokens are unique
verificationTokenSchema.index({ token: 1 }, { unique: true });

// Set a compound index for finding tokens for a specific user
verificationTokenSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
