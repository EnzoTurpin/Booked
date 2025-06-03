const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    equipments: [
      {
        type: String,
        enum: [
          "projector",
          "whiteboard",
          "videoconference",
          "computer",
          "wifi",
          "catering",
        ],
      },
    ],
    image: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
