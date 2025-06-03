const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availabilitySlotSchema = new Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const availabilitySchema = new Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slots: [availabilitySlotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
