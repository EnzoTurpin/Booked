import mongoose, { Document, Schema } from "mongoose";

export interface IUnbanRequest extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const unbanRequestSchema = new Schema<IUnbanRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  { timestamps: true }
);

export default mongoose.model<IUnbanRequest>(
  "UnbanRequest",
  unbanRequestSchema
);
