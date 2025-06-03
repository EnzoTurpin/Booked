const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String, // URLs to images, if any
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    response: {
      text: String,
      date: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only leave one review per professional
reviewSchema.index({ userId: 1, professionalId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
