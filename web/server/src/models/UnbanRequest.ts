import mongoose, { Document, Schema } from "mongoose";

export interface IUnbanRequest extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  getUserIdString(): string;
}

const unbanRequestSchema = new Schema<IUnbanRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ajouter une méthode pour obtenir l'ID utilisateur sous forme de chaîne
unbanRequestSchema.methods.getUserIdString = function () {
  return this.userId.toString();
};

export default mongoose.model<IUnbanRequest>(
  "UnbanRequest",
  unbanRequestSchema
);
